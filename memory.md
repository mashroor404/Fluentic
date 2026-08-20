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

The global header is inserted from `templates/partials/header.html`. The user changed `templates/layouts/base.html` to render the footer from `templates/partials/Footer2.html`; preserve that wiring unless they explicitly request another footer partial.

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

The four default cards use the downloaded local Solution Image assets through `get_asset_url`. The eyebrow is rendered with `btn_macros.eyebrow_label` from `/Fluentic/Macros/Button.html`, keeping it consistent with other theme modules. Desktop cards follow the reference's asymmetric 5/7 then 8/4 column layout, becoming two equal columns on tablet and one column on mobile. Styling is scoped per module instance and consumes the project's global color, typography, border, and container variables. The initial module intentionally has no animation or external JavaScript dependency.

## Hero module

`modules/Hero.module/` was rebuilt on 2026-08-20 to match the live Fluentic Webflow hero pixel-for-pixel, using values read directly from the deployed stylesheet (`https://cdn.prod.website-files.com/6977d6f2fb8c2461d31d41d2/css/fluentic.webflow.shared.793a05b7f.css`) and page markup rather than guessed proportions:

- `.hero-section` is a thin 16px (10px ≤991px) frame with `background_color`; the real card is `.hero-content-block` — `border-radius:16px`, `overflow:hidden`, `padding-top:168px` stepping down to 140/120/100px at 991/767/479px breakpoints.
- Hero copy sits in a `.hero-container` capped at 1240px (module field `content_max_width`, default now 1240 not the old 960), independent of the theme's own `--container-max-width` (~1920px) so the hero doesn't inherit the site-wide container width.
- `h1.hero-heading` needed an explicit size: the theme's global `--text-h1` token (`css/elements/_typography.css`) caps out at 62px, but the live hero h1 is 76px desktop / 54px ≤991px / 40px ≤767px, line-height 1.07, weight 500, letter-spacing 0 — set locally in the module, not by touching the shared token.
- The dashboard visual is a *glass shell* (`.hero-image-block`: `backdrop-filter:blur(90px)`, gradient `rgba(255,255,255,.2)→rgba(255,255,255,.6)`, top-only radius 40/32/24px, padding 32px→10px at 479px) wrapping an inner flex column (`.hero-image-wrap`, max-width 840px, padding 60px 100px 0 desktop) that holds, in document order: the chat panel, then the dashboard `<img>`, then the two particle images.
- The example conversation shows **all messages stacked together** (confirmed against a live screenshot on 2026-08-20, superseding an earlier guess based on the raw HTML's `display:none` attributes that it cycled one-at-a-time). The rebuilt module renders every `.hero-message-wrapper` in the flow and staggers their entrance (`.message-text-wrap` scale/opacity pop-in, `transition-delay` per `nth-child`, up to the field's max of 6) once via `IntersectionObserver` adding `.is-visible` to `[data-hero-messages]` — no infinite loop, no hiding after reveal. Skips the animation (shows instantly) under `prefers-reduced-motion`.
- Message avatars are `border-radius:5px` (squared, not circular); particles are absolutely positioned inside `.hero-image-wrap` (`--one`: bottom -27%/-2% left, max-width 159→50px; `--two`: top-right, `z-index:-1`, max-width 208→100px) so they peek from behind the glass panel edges, and both have a continuous CSS `translateY` float animation (disabled under `prefers-reduced-motion`).
- Background video has a play/pause toggle button (`data-hero-video-toggle`, bottom-right, rounded-square glass button per user-supplied reference screenshots — not a circle). As of the second revision (2026-08-20) it lives **inside `.hero-content-block`, as a sibling of `.hero-video` and `.hero-container`** (not nested inside `.hero-video`, whose stacking context would trap it below the content regardless of its own z-index).
- **Second revision (2026-08-20), driven by user-supplied screenshots of the live site**, corrected three things from the first pass:
  1. The outer shell is a **90%-width inset rounded card** (`.hero-content-block { width:90%; border-radius:24px; }`), not a fixed-16px-pixel inset — the user explicitly asked for the percentage-based treatment over the live site's literal pixel value. The background video now lives *inside* `.hero-content-block` (not a sibling of it inside `.hero-section`) specifically so it gets clipped to that rounding; `.hero-section` itself only carries small vertical padding now.
  2. The two "Hero Particle" images float continuously (`translateY` keyframe loop, disabled under `prefers-reduced-motion`) — confirmed against a live screenshot showing the crystal/cube particles mid-motion.
  3. The dashboard "image" is actually a **real, interactive chat-input card** (`.hero-chat-card`, new `chat_demo` field group), not a flat PNG: a model/search pill toolbar, a live text input + send button wrapped in a `<form>`, and quick-suggestion pills. Typing and pressing enter/send, or clicking a suggestion, appends a genuine new `.hero-message-wrapper` bubble to `[data-hero-messages]`, shows a brief typing-dots bubble, then appends a canned reply drawn from the editable `chat_demo.auto_replies` pool (bubble count capped at 6, oldest trimmed). `visual.main_image` is kept only as a fallback rendered when `chat_demo.enabled` is off.
- The eyebrow badge keeps the project's existing shared `.eyebrow-custom` macro styling (flat pill, blinking cursor) rather than the live site's separate frosted `.sub-title` pill component — that component is shared site-wide via `Macros/Button.html`/`global.css`, so it was intentionally left alone; revisit only if asked to redo eyebrows globally.

## Global Footer module

`modules/Global/Footer.module/` was rebuilt from the Fluentic Webflow footer reference while preserving its existing folder name, `Footer` label, and HubSpot module ID `383963363024`. Both footer partial files may reference this module, but `templates/layouts/base.html` currently renders `templates/partials/Footer2.html`; do not revert it to the older footer partial.

The editable schema now covers the brand logo/link/description, four selectable social platforms, repeatable navigation columns and links, optional oversized wordmark, copyright rich text, and repeatable legal links. The bundled Fluentic logo and large Logo Text SVGs are local `get_asset_url` fallbacks. The module renders a section with the required `footer` class inside the existing global `<footer>` partial, avoiding invalid nested footer landmarks. Styling uses global theme variables and follows the reference's desktop, tablet, and mobile layout without adding JavaScript.

## CTA module

`modules/CTA.module/` recreates the Webflow `<section class="cta-section">` as an editable HubSpot DnD page module. Editor fields control the eyebrow, heading, button visibility/text/link, illustration visibility/image/alt text, and background-image visibility/image.

The module imports `/Fluentic/Macros/Button.html`, uses `btn_macros.eyebrow_label` and the light `btn_macros.secondary_button`, and resolves the bundled `CTA BG.webp` and `CTA Image.webp` files through `get_asset_url` when editors have not selected replacements. Its scoped responsive CSS consumes global background, text, font, weight, border-radius, and container variables. It intentionally has no JavaScript dependency.
