const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const rootDir = __dirname; 

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(rootDir, ".env"));
const destination = process.env.HUBSPOT_WATCH_DEST || "/Fluentic";
const account = process.env.HUBSPOT_ACCOUNT || "246817745";
const publishMode = process.env.HUBSPOT_WATCH_MODE || "draft";
const isDryRun = process.argv.includes("--dry-run");

if (!/^\/[A-Za-z0-9/_.-]*$/.test(destination)) {
  console.error(
    "HUBSPOT_WATCH_DEST must be an absolute Design Manager path using only letters, numbers, /, _, ., and -, such as /Fluentic."
  );
  process.exit(1);
}

if (!/^\d+$/.test(account)) {
  console.error("HUBSPOT_ACCOUNT must be a numeric HubSpot account/portal ID.");
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
  // On Windows, global npm binaries like `hs` are `.cmd` shims that
  // child_process.spawn cannot resolve by name without a shell.
  shell: process.platform === "win32",
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
