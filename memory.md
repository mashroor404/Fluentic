# Fluentic HubSpot Theme Memory

Last reviewed: 2026-08-20

## What this project is

This repository is a HubSpot CMS theme. The root contains the theme definition, editable theme settings, global styles, templates, reusable modules, macros, JavaScript, and image assets.

```text
theme.json       HubSpot theme metadata
fields.json      Theme-level settings shown in HubSpot's theme editor
templates/       Page, blog, layout, and global-partial templates
modules/         Reusable HubSpot modules; each module normally has fields.json and module.html
css/main.css     Global stylesheet entry point
css/elements/    Global design tokens and element styles
js/main.js       Shared browser behavior
Macros/          Reusable HubL macros, especially buttons and eyebrow labels
images/          Theme preview/static image assets
```

## How the HubSpot theme is configured

1. `theme.json` identifies the theme as `Fluentic`, makes it available for new content, disables domain stylesheets, defines a mobile breakpoint at 767px, and points the preview screenshot at `/Fluentic/images/TransparentHeader.png`.
2. The root `fields.json` defines the settings exposed by the theme editor. The current groups are global colors, global fonts, general styles, buttons, and container width.
3. HubSpot exposes those root settings to HubL CSS through the `theme` object. For example, `theme.theme_colors.background_colors.dark_bg.color` reads the Dark Background color from `fields.json`.
4. `templates/layouts/base.html` is the shared page shell. It loads `css/main.css`, optional template CSS, HubSpot's standard header includes, `js/main.js`, and standard footer includes. It also renders the global header and footer partials.
5. `css/main.css` includes the reset, normalize, typography, global styles, buttons, and forms files. It includes `css/elements/global.css`, which maps theme settings into CSS custom properties.
6. Pages and blog templates extend `templates/layouts/base.html`. A new page uses a template with `templateType: page`; blog listing and post templates use their corresponding HubSpot template types.
7. In HubSpot, sync/upload the complete theme folder, publish it, then create/edit content with one of the theme's page or blog templates. Theme settings are then available from the theme editor and flow into the rendered CSS.

## Local HubSpot draft watcher

Run `npm run watch:hubspot` from the theme root to perform an initial upload and then continuously sync local theme changes to `/Fluentic` in HubSpot account `246817745`. The wrapper delegates to the installed native command `hs watch . /Fluentic --account 246817745 --initial-upload --cms-publish-mode draft`; draft mode makes changes available in Design Manager and HubSpot preview without publishing them to live pages.

This repository stores module schemas directly as `fields.json`, so no `fields.js` compiler or npm watcher dependency is needed. The watcher covers module HTML, fields JSON, CSS, JavaScript, templates, macros, assets, and root theme settings. Stop it with `Ctrl+C`. Run `npm run watch:hubspot:check` to verify the resolved command without uploading anything.

Environment overrides are available when needed: `HUBSPOT_ACCOUNT`, `HUBSPOT_WATCH_DEST`, and `HUBSPOT_WATCH_MODE` (`draft` or `publish`). Publish mode can affect live pages and should only be used intentionally. `.hsignore` prevents GitHub configuration, Markdown notes, and local watcher/package files from being uploaded. The watcher intentionally does not use `--remove`, so it will not delete remote files that are absent locally.

## Theme setting to CSS mapping

The important mapping is in `css/elements/global.css` (also duplicated in `css/main.css`):

```text
theme.theme_colors.*                         -> --primary-color, --bg-*, --text-*, --gradient-*
theme.global_fonts.*                         -> --primary-font, --secondary-font, --tertiary-font
theme.general_styles.*                       -> --global-border-width/color/radius
theme.buttons.primary_button.*               -> --btn-primary-*
theme.buttons.secondary_button.*             -> --btn-secondary-*
theme.container.container_max_width          -> --container-max-width
```

Current defaults include primary blue `#2F6BFF`, dark background `#0B0F1A`, primary text `#011032`, secondary text `#6B738B`, Inter Display as the primary font, Geist as the secondary font, Geist Mono as the tertiary font, and a 1920px container max width.

## Rendering flow

```text
HubSpot theme editor
  -> root fields.json values
  -> HubL theme.* references in global.css
  -> CSS variables emitted by main.css
  -> template extends base.html
  -> base renders global header + page body + global footer
  -> module fields and markup render the page sections
```

## Reusable module pattern

Most modules are folders named `*.module` with `meta.json`, `fields.json`, `module.html`, and usually empty `module.css`/`module.js` placeholders. Module HTML commonly:

- imports `/Fluentic/Macros/Button.html` as `btn_macros`;
- wraps inline styles in `{% require_css %}` and `{% scope_css %}`;
- uses `module.<field_name>` values defined by that module's `fields.json`;
- uses `{% require_js %}` for module-specific GSAP/ScrollTrigger behavior;
- uses shared tokens such as `var(--text-primary)`, `var(--bg-primary)`, `var(--gradient-4)`, and `var(--container-max-width)`;
- uses `btn_macros.animated_button`, `btn_macros.secondary_button`, and `btn_macros.eyebrow_label` for shared UI.

All buttons added to modules must come from `/Fluentic/Macros/Button.html`; do not recreate button markup in a module. Use `btn_macros.animated_button(...)` for the black/base button (`data-wf--button-primary--variant="base"`) and `btn_macros.secondary_button(...)` for the white/variant-2 button (`data-wf--button-primary--variant="v2"`).

Use `var(--text-primary)` for paragraph text in new and refined modules unless the user explicitly requests a secondary/muted treatment.

The global header is inserted from `templates/partials/header.html`. The user changed `templates/layouts/base.html` to render the footer from `templates/partials/Footer2.html`; preserve that wiring unless they explicitly request another footer partial.

**HubSpot `fields.json` reserved name:** a group/repeater child field cannot be named `"label"` — HubSpot's upload validator rejects the whole theme upload with `field name cannot be 'label'` (only caught at `hs upload`/CI deploy time, not by local JSON validation). It collides with the field schema's own `label` property. Use `text` (or any other name) for a repeater's display-text child field instead, and match it in `occurrence.sorting_label_field` and the HubL that reads it. Hit this in [[Hero.module]]'s `chat_demo.suggestions` repeater on 2026-08-20.

## Things to verify before deployment

- The deployed Design Manager folder is `/Fluentic` in HubSpot account `246817745`. Theme-owned imports, module paths, and the screenshot path were normalized to this folder on 2026-08-19.
- Blog templates still use `/Re-board theme` module and screenshot paths. Those modules are not present in this repository, so blog templates need path/module cleanup before relying on them.
- `templates/partials/header.html` references `../../modules/Global/header.module` (lowercase `header`), while the checked-in folder is `modules/Global/Header.module`. Confirm the deployed filesystem's case behavior or normalize the path and folder.
- `css/elements/global.css` defines `--bg-primary` and `--text-primary`, but several older styles reference names such as `--primary-bg`, `--primary-dark-text-color`, `--border-width`, and `--border-color`. If those styles render incorrectly, this variable-name mismatch is a likely cause.
- `gradient_1` is exposed in `fields.json` but `global.css` hard-codes `--gradient-1: transparent` instead of reading the theme value.
- `css/main.css` and `css/elements/global.css` contain duplicated token/style blocks. Keep them synchronized or use only one canonical definition when changing theme tokens.
- This repository has no checked-in HubSpot CLI/project configuration, so the exact remote destination and upload command must be confirmed in the local HubSpot account/CLI setup.

## Fluentic Webflow reference: fonts and colors

The public Webflow reference at <https://fluentic.webflow.io/> publishes its stylesheet at `cdn.prod.website-files.com/.../css/fluentic.webflow.shared.793a05b7f.css`.

Font findings:

- The family is `GeneralSans` / `Generalsans`.
- Body and heading variables both resolve to `Generalsans, Arial, sans-serif`.
- Published weights are 300 Light, 400 Regular, 500 Medium, 600 Semibold, and 700 Bold, all loaded as `.otf` files.

Core color tokens from the live stylesheet:

| Role | Hex |
| --- | --- |
| Page gray | `#F8F7F8` |
| Main text / dark plum | `#1B0C27` |
| Cream background | `#FFF7E5` |
| White | `#FFFFFF` |
| Purple | `#D37BFF` |
| Pink | `#FF82E1` |
| Orange | `#FCAC84` |
| Blue | `#80AAFD` |
| Red | `#F82A2D` |
| Bright accent red | `#FF464F` |
| Dark gray | `#EDECEF` |
| Stroke | `#E9E9E9` |
| Neutral 7 | `#EDEBE9` |
| Neutral 8 | `#F6F5F4` |

The main accent gradient is `linear-gradient(120deg, #F0E9F7, #D588FC 61%, #FF49D4)`. A smaller icon gradient uses `linear-gradient(#FFF, #F0EAF6)`. These Webflow values are the best visual reference when aligning the HubSpot theme; they are not currently the same as the existing HubSpot defaults in root `fields.json`.

## Fluentic Webflow reference assets

The original media referenced by the public homepage and its published stylesheet was downloaded on 2026-08-19 to `css/elements/Assets/`:

```text
images/              30 raster images and video poster frames
icons/               22 SVG files
video/                4 MP4/WebM files
asset-manifest.csv   Local filename-to-source URL mapping
```

Responsive `srcset` renditions were excluded when an original source asset was available. Use `asset-manifest.csv` to trace a local file back to its Webflow CDN URL.

## Solution section module

`modules/solution-section.module/` recreates the second section of the Fluentic Webflow homepage as an editable HubSpot DnD module. Its editor fields control the eyebrow, heading, description, and a repeatable list of one to eight solution cards. Each card has editable title, description, image visibility, and image selection.

The four default cards use the downloaded local Solution Image assets through `get_asset_url`. The eyebrow is rendered with `btn_macros.eyebrow_label` from `/Fluentic/Macros/Button.html`, keeping it consistent with other theme modules. Desktop cards follow the reference's asymmetric 5/7 then 8/4 column layout, becoming two equal columns on tablet and one column on mobile. Styling is scoped per module instance and consumes the project's global color, typography, border, and container variables.

The solution images render at their natural proportions rather than through a shared aspect-ratio crop. This is intentional: the reference assets have different intrinsic widths but the same 1336px height, and those proportions correspond to the asymmetric 5/7 and 8/4 desktop card widths. The grid stretches items and each card uses a full-height flex column so both cards in each visual row remain equal in outer height.

GSAP and ScrollTrigger are supplied by `templates/layouts/base.html` and must not be loaded again in this module. The scoped module animation reveals the eyebrow, heading words, and description in a tightly overlapped sequence beginning at 0s, 0.12s, and 0.3s respectively. Card rows reveal independently from 50px below as they reach the viewport; desktop/tablet rows contain two cards and mobile cards reveal individually. Reduced-motion users receive the fully visible static layout.

## Hero module

`modules/Hero.module/` was rebuilt on 2026-08-20 to match the live Fluentic Webflow hero pixel-for-pixel, using values read directly from the deployed stylesheet (`https://cdn.prod.website-files.com/6977d6f2fb8c2461d31d41d2/css/fluentic.webflow.shared.793a05b7f.css`) and page markup rather than guessed proportions:

- `.hero-section` is a thin 16px (10px ≤991px) frame with `background_color`; the real card is `.hero-content-block` — `border-radius:16px`, `overflow:hidden`, `padding-top:168px` stepping down to 140/120/100px at 991/767/479px breakpoints.
- Hero copy sits in a `.hero-container` capped at 1240px (module field `content_max_width`, default now 1240 not the old 960), independent of the theme's own `--container-max-width` (~1920px) so the hero doesn't inherit the site-wide container width.
- `h1.hero-heading` needed an explicit size: the theme's global `--text-h1` token (`css/elements/_typography.css`) caps out at 62px, but the live hero h1 is 76px desktop / 54px ≤991px / 40px ≤767px, line-height 1.07, weight 500, letter-spacing 0 — set locally in the module, not by touching the shared token.
- The dashboard visual is a *glass shell* (`.hero-image-block`: `backdrop-filter:blur(90px)`, gradient `rgba(255,255,255,.2)→rgba(255,255,255,.6)`, top-only radius 40/32/24px, padding 32px→10px at 479px) wrapping an inner flex column (`.hero-image-wrap`, max-width 840px, padding 60px 100px 0 desktop) that holds, in document order: the chat panel, then the dashboard `<img>`, then the two particle images.
- The example conversation shows **all messages stacked together** (confirmed against a live screenshot on 2026-08-20, superseding an earlier guess based on the raw HTML's `display:none` attributes that it cycled one-at-a-time). The rebuilt module renders every `.hero-message-wrapper` in the flow and staggers their entrance (`.message-text-wrap` scale/opacity pop-in, `transition-delay` per `nth-child`, up to the field's max of 6) once via `IntersectionObserver` adding `.is-visible` to `[data-hero-messages]` — no infinite loop, no hiding after reveal. Skips the animation (shows instantly) under `prefers-reduced-motion`.
- Message avatars are `border-radius:5px` (squared, not circular); particles are absolutely positioned inside `.hero-image-wrap` (`--one`: bottom -27%/-2% left, max-width 159→50px; `--two`: top-right, `z-index:-1`, max-width 208→100px) so they peek from behind the glass panel edges, and both have a continuous CSS `translateY` float animation (disabled under `prefers-reduced-motion`).
- Background video has a play/pause toggle button (`data-hero-video-toggle`, bottom-right, rounded-square glass button per user-supplied reference screenshots — not a circle). As of the second revision (2026-08-20) it lives **inside `.hero-content-block`, as a sibling of `.hero-video` and `.hero-container`** (not nested inside `.hero-video`, whose stacking context would trap it below the content regardless of its own z-index).
- **Second revision (2026-08-20), driven by user-supplied screenshots of the live site**, corrected three things from the first pass: a 90%-width inset rounded card instead of a fixed-16px-pixel inset, continuous `translateY` floating on the two "Hero Particle" images, and replaced the flat dashboard PNG with a real interactive chat-input card (model/search pills, live input+send form, suggestion pills) that appended genuine new messages on submit.
- **Third revision (2026-08-20), same day — the user reverted parts of the second pass** after seeing it rendered:
  1. Outer shell: back to `.hero-content-block { width:100%; border-radius:16px; }` with `.hero-section` padding exactly `16px 16px 0` (top/left/right only, no bottom, no `padding-bottom` on the content block either) — the literal live-site pixel values, not the 90%/24px card from revision two. The video still lives *inside* `.hero-content-block` (kept from rev two) so it stays clipped to the rounding.
  2. The chat-input card reverted to being **just the flat `visual.main_image` PNG again** — the `chat_demo` field group and `.hero-chat-*` markup/CSS from revision two were deleted outright, not just disabled, since the user explicitly asked for "the previous one."
  3. The conversation bubbles are **not interactive at all** now — no typing, no input. Instead they autoplay on a loop like a looping product-demo clip: each `module.messages` bubble starts hidden (`.is-pending`, JS-applied only — see below), reveals directly (pop-in transition, no typing-dots step — that was tried and then explicitly removed per user feedback the same day, so don't re-add a typing indicator unless asked again), holds for `HOLD_MS`, then after the full conversation has played and held for `LOOP_PAUSE_MS` the whole block resets to `.is-pending` and replays. Pauses via `IntersectionObserver` when scrolled out of view (guarded with a `running` flag against double-starting the loop on rapid intersect toggles). **Progressive-enhancement gotcha worth remembering:** the hide/reveal logic must key off a JS-only "hidden" class (`.is-pending`) that nothing carries by default — inverting it to hide-by-default via `:not(.is-shown)` (what the second pass's stagger CSS effectively did) silently breaks the no-JS fallback, since nothing will ever exist to *add* the missing class. `prefers-reduced-motion` short-circuits before any of this runs, leaving the server-rendered conversation fully visible and static.
  4. The video play/pause button (`.hero-video-toggle`) was restyled smaller and glassier per a user reference image: 48px→36px (32/28px at the smaller breakpoints), background opacity 0.55→0.22, blur 10px→14px, and icon color switched from `var(--text-primary)` to plain white (`color: #fff`, since both SVGs use `fill="currentColor"`).
- The eyebrow badge originally kept its own styling (flat pill, blinking cursor) instead of matching the live site's frosted `.sub-title` pill; left alone in the first two revisions since it's a site-wide shared component, out of Hero's scope. **Fixed site-wide on 2026-08-20** (user asked directly): removed the blinking-cursor `<span class="eyebrow-cursor">` from `Macros/Button.html`'s `eyebrow_label` macro and from two modules that had hand-copied the eyebrow markup instead of using the macro (`Trusted by.module`, `Execution.module` — search for `eyebrow-custom` before adding a new eyebrow anywhere, some modules don't call the macro). Also deleted a second, dead `.eyebrow-custom`/`.eyebrow-cursor` definition in `css/elements/global.css` that `css/elements/_buttons.css` (loaded after it) was silently overriding — `_buttons.css` is now the sole canonical eyebrow definition (frosted pill, `border-radius:999px`, `backdrop-filter:blur(10px)`, no cursor).
- Button hover text-swap animation (`.button-primary`, `.button-text` in `css/elements/_buttons.css`) was slowed down on request (300/400ms → 550/650ms) to read closer to the live site's pace. The live site actually drives this via Webflow's compiled IX2 JS, not a discoverable CSS transition value, so this duration is a considered approximation, not a scraped exact match — revisit if it still reads too fast/slow.

## Global Footer module

`modules/Global/Footer.module/` was rebuilt from the Fluentic Webflow footer reference while preserving its existing folder name, `Footer` label, and HubSpot module ID `383963363024`. Both footer partial files may reference this module, but `templates/layouts/base.html` currently renders `templates/partials/Footer2.html`; do not revert it to the older footer partial.

The editable schema now covers the brand logo/link/description, four selectable social platforms, repeatable navigation columns and links, optional oversized wordmark, copyright rich text, and repeatable legal links. The bundled Fluentic logo and large Logo Text SVGs are local `get_asset_url` fallbacks. The module renders a section with the required `footer` class inside the existing global `<footer>` partial, avoiding invalid nested footer landmarks. Styling uses global theme variables and follows the reference's desktop, tablet, and mobile layout without adding JavaScript.

## CTA module

`modules/CTA.module/` recreates the Webflow `<section class="cta-section">` as an editable HubSpot DnD page module. Editor fields control the eyebrow, heading, button visibility/text/link, illustration visibility/image/alt text, and the panel's Background Image.

The module imports `/Fluentic/Macros/Button.html`, uses `btn_macros.eyebrow_label` and the light `btn_macros.secondary_button`, and resolves the bundled `CTA BG.webp` and `CTA Image.webp` files through `get_asset_url` when editors have not selected replacements. The editor's image field is labeled `Background Image`; `.cta-content-block` uses that selected/fallback artwork as its background and no longer uses `var(--text-primary)` as a background-color fallback.

Its scoped GSAP timeline follows the solution-section timing: badge at 0s, heading words at 0.12s, and the macro button at 0.3s. The illustration continuously rotates clockwise through positive Z rotation over 12 seconds with `transform-style: preserve-3d`, `will-change: transform`, and GSAP `force3D`. GSAP/ScrollTrigger still come only from `templates/layouts/base.html`, and all CTA motion is disabled for reduced-motion users.

## Blog cards module

`modules/Blog cards.module/` recreates the reference `<section id="Blog" class="blog-section">` as an editable HubSpot DnD module. Its card group is repeatable from one to three items. HubSpot does not provide a native individual-blog-post picker field, so each card combines a supported `blog` field with a post-position field (`1` is newest, `2` is second newest, and so on). The module uses `blog_recent_posts` to pull the selected post's live URL, featured image, first topic, publish date, and title.

The heading and Explore All link are editable. The white Explore All button uses `btn_macros.secondary_button` (variant 2). The responsive card grid changes from three columns to two and then one, and featured images scale slightly on card hover/focus. Styling is scoped and uses global Fluentic color/font/border/container variables.

The blog heading carries `gsap_split_word`; its DOM-created word spans carry `gsap_split_word1` and slide upward in a stagger. The macro button starts its own 50px fade-up shortly afterward. Blog cards reveal from 50px below in visual rows sized to the active grid: three cards on desktop, two on tablet, and one on mobile. Animation queries are scoped per module instance and disabled for reduced-motion users; GSAP and ScrollTrigger continue to come from `templates/layouts/base.html`.

## FAQ v2 module

`modules/FAQ v2.module/` recreates the homepage `<section id="FAQ" class="faq-section">` as an editable HubSpot DnD module. It uses the global eyebrow macro, global fonts/colors/borders, the original five FAQ questions and answers, and the downloaded Fluentic plus/minus icons and three FAQ avatars.

The FAQ list is a repeater with one to twelve items. The contact avatar field is also a repeater (up to six images); when it is empty, the three bundled Fluentic avatars render as local fallbacks. All FAQ items are closed by default. Accordion controls use semantic buttons with `aria-expanded`, `aria-controls`, labelled regions, keyboard support, and single-open behavior. The open/close transition is intentionally quick: 320ms for panel height and 220ms for opacity/icons.

Its GSAP sequence matches the existing module language: eyebrow at 0s, split heading words at 0.12s, contact prompt at 0.34s, and each accordion item revealing 50px upward as it reaches the viewport. Reveal tweens use brisk 0.45–0.5s durations. Selectors and initialization are scoped to each module instance, GSAP is not loaded again, and reduced-motion users receive a static fully visible layout.

## Demo text block wrap module

`modules/demo-text-block-wrap.module/` recreates the homepage `.demo-text-block-wrap` CTA ribbon. Editors can change its repeated text, destination link, and separator icon; the downloaded `Vector.svg` gradient mark is the local fallback. The server-rendered track follows the reference structure with six text panels and seven circular icon separators.

Desktop text panels are 1215px wide with 212px icon circles. The module follows the reference's 991px, 767px, and 479px steps (800/600/400px text and 160/140/120px icons). Typography and surfaces use the theme's global font and color tokens.

GSAP ScrollTrigger scrubs the complete track from `xPercent: 0` to `xPercent: -6` between `top bottom` and `bottom top`, with `scrub: 1.2` for a slower, smoother response. Scrolling down therefore moves the track gently left, while scrolling upward naturally reverses it to the right. The track uses `will-change: transform`, `transform-style: preserve-3d`, and `force3D`; motion is disabled under `prefers-reduced-motion`.

## Pricing Comparison module

`modules/Pricing Comparison.module/` recreates the Fluentic pricing section as an editable HubSpot DnD module. Its field model is `plans` repeating group → nested `cards` repeating group → repeating `features` text field. Defaults provide Monthly and Yearly tabs, each with Free, Plus, and Pro cards.

Every card has editable name, description, card-icon SVG markup, feature-icon SVG markup, price, billing period, features heading/list, button text/link, popular toggle, popular label, and popular background image. The feature icon is configured once per card and reused for every row in that card's repeatable features list. Popular cards use the highlighted inset-header design, the base/black global button macro, and the selected background image or bundled `Pricing Card Particle.svg` fallback. Regular cards use the white/variant-2 global button macro.

Plan filtering uses semantic tabs and tabpanels with synchronized `aria-selected`, keyboard Left/Right/Home/End navigation, and instance-scoped IDs. The first plan is active initially. The header uses the established eyebrow and split-word GSAP reveal; the active `.pricing-comparison__panel` rises from 50px as soon as the section enters the viewport, and newly selected plan cards receive a short staggered reveal. Reduced-motion mode preserves filtering without animation.
