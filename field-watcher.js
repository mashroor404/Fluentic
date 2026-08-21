const path = require("node:path");
const { spawn } = require("node:child_process");

const rootDir = __dirname;
const destination = process.env.HUBSPOT_WATCH_DEST || "/Fluentic";
const account = process.env.HUBSPOT_ACCOUNT || "246817745";
const publishMode = process.env.HUBSPOT_WATCH_MODE || "draft";
const isDryRun = process.argv.includes("--dry-run");

if (!destination.startsWith("/")) {
  console.error("HUBSPOT_WATCH_DEST must be an absolute Design Manager path, such as /Fluentic.");
  process.exit(1);
}

if (!new Set(["draft", "publish"]).has(publishMode)) {
  console.error('HUBSPOT_WATCH_MODE must be either "draft" or "publish".');
  process.exit(1);
}

const args = [
  "watch",
  ".",
  destination,
  "--account",
  account,
  "--initial-upload",
  "--cms-publish-mode",
  publishMode,
];

console.log("HubSpot Theme Watcher");
console.log(`Local theme: ${path.resolve(rootDir)}`);
console.log(`Remote path: ${destination}`);
console.log(`Account: ${account}`);
console.log(`Upload mode: ${publishMode}`);
console.log("Watching module HTML, fields.json, CSS, JavaScript, templates, macros, and theme settings.");

if (publishMode === "publish") {
  console.warn("Warning: publish mode can immediately affect pages using this theme.");
}

if (isDryRun) {
  console.log(`Dry run command: hs ${args.join(" ")}`);
  process.exit(0);
}

const watcher = spawn("hs", args, {
  cwd: rootDir,
  stdio: "inherit",
});

watcher.on("error", (error) => {
  if (error.code === "ENOENT") {
    console.error("HubSpot CLI was not found. Install it globally before starting the watcher.");
  } else {
    console.error(`Unable to start HubSpot watcher: ${error.message}`);
  }
  process.exit(1);
});

watcher.on("exit", (code, signal) => {
  if (signal) {
    console.log(`HubSpot watcher stopped (${signal}).`);
    process.exit(0);
  }

  process.exit(code ?? 1);
});

const stopWatcher = (signal) => {
  if (!watcher.killed) watcher.kill(signal);
};

process.once("SIGINT", () => stopWatcher("SIGINT"));
process.once("SIGTERM", () => stopWatcher("SIGTERM"));
