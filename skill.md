# Fluentic HubSpot Theme Development Skill

This is the project playbook for building future HubSpot modules and templates in the Fluentic theme.

## Before editing

1. Read `memory.md` and inspect `theme.json`, root `fields.json`, `templates/layouts/base.html`, `css/main.css`, and `css/elements/global.css`.
2. Use `/Fluentic` as the deployed theme folder. The remaining `/Re-board theme` references belong to unresolved legacy blog dependencies.
3. Check the actual case of global module folders and paths.
4. Reuse existing tokens and macros before adding new colors, fonts, button markup, or layout conventions.

## Add a new module

Create a directory such as `modules/Example.module/` containing:

```text
meta.json
fields.json
module.html
module.css     optional; current project often keeps styles inline in module.html
module.js      optional; current project often keeps scripts inline in module.html
```

Use a unique module label and the correct HubSpot `content_types` and `host_template_types` in `meta.json`. Define every editor field in `fields.json`; access those values as `module.field_name` in HubL.

Preferred `module.html` shape:

```html
{% import '/Fluentic/Macros/Button.html' as btn_macros %}

{% require_css %}
<style>
  {% scope_css %}
  .example-section {
    max-width: var(--container-max-width);
    color: var(--text-primary);
    background: var(--bg-primary);
  }
  {% end_scope_css %}
</style>
{% end_require_css %}

<section class="example-section">
  <div class="container">
    {% if module.title %}<h2>{{ module.title }}</h2>{% endif %}
  </div>
</section>
```

Add `{% require_js %}` only when the module needs behavior. Scope selectors to the module and guard optional fields so empty editor values do not create broken markup.

## Add a page template

Start from the shared shell:

```html
<!--
  templateType: page
  isAvailableForNewContent: true
  label: Example page
-->
{% extends "./layouts/base.html" %}

{% block body %}
{% dnd_area "dnd_area" %}
{% end_dnd_area %}
{% endblock body %}
```

Use `/Fluentic/modules/<Module name>` in `dnd_module` declarations. Keep global header/footer rendering in the base layout unless a page intentionally overrides the blocks.

## Change theme-wide design settings

1. Add or edit the setting in root `fields.json` with a stable `name`, editor-friendly `label`, correct HubSpot field `type`, and a safe default.
2. Read the setting from `theme.<group>.<name>` in the canonical global stylesheet.
3. Expose it as a CSS custom property under `:root`.
4. Use that variable from modules/templates instead of repeating a literal value.
5. Check both `css/main.css` and `css/elements/global.css`, because this repository currently duplicates the token block.
6. Render a page using `templates/ABR-Home.html` or a scratch template and verify desktop and mobile behavior.

Example:

```json
{
  "label": "Card shadow",
  "name": "card_shadow",
  "type": "color",
  "default": { "color": "#000000", "opacity": 10 }
}
```

```css
:root {
  --card-shadow-color: {{ theme.general_styles.card_shadow.color }};
}
```

## Verification checklist

- Validate all changed JSON with `jq`.
- Search for every new field name and confirm the HubL path matches `fields.json`.
- Confirm `{% extends %}`, `{% include %}`, `{% global_partial %}`, macro imports, and module paths resolve from the deployed theme folder.
- Check that a module has no unscoped global selectors or duplicate IDs.
- Check that theme variables exist before using them. Current legacy aliases are not guaranteed: `--primary-bg`, `--primary-dark-text-color`, `--border-width`, and `--border-color` differ from the newer `--bg-primary`, `--text-primary`, `--global-border-width`, and `--global-border-color` names.
- Verify the page in the HubSpot editor and in the published preview after upload/sync.

## Preview branch changes in HubSpot

- Run `npm run watch:hubspot` at the repository root to initial-sync and continuously upload local changes to `/Fluentic` in account `246817745` as drafts.
- This theme uses checked-in `fields.json` files, so do not add a separate `fields.js` compilation watcher unless the schema format is intentionally migrated later.
- Use `npm run watch:hubspot:check` for a non-uploading configuration check.
- Keep local-only files in `.hsignore`; do not add `--remove` to the watch command because branch changes must not delete unrelated remote assets.
- Keep draft mode as the default. Use `HUBSPOT_WATCH_MODE=publish` only when the user explicitly intends to update published theme files.
- Stop the watcher with `Ctrl+C`, and confirm the changed module in Design Manager or HubSpot's preview before merging the branch.

## Lessons captured from this project

- Root `fields.json` is for theme-wide editor settings; a module's own `fields.json` is for module content/style controls.
- `theme.json` metadata alone does not style a page. The settings become visible in rendered output only when a stylesheet reads them through HubL's `theme` object.
- `base.html` is the most important integration point: it loads the global CSS/JS and owns the reusable header/footer partials.
- The current `base.html` intentionally renders `templates/partials/Footer2.html`. Preserve this user-selected footer wiring unless the user explicitly asks to change it.
- `require_css`/`scope_css` and `require_js` are the established module conventions here.
- Theme-owned absolute paths must start with `/Fluentic`. Do not copy the remaining `/Re-board theme` blog paths into new modules.

## Match the live Fluentic visual system

When converting or extending the Webflow design, use the live reference values captured in `memory.md`:

- Use `GeneralSans` for both primary and secondary font roles, with the available 300/400/500/600/700 weights and `Arial, sans-serif` fallback.
- Use `#1B0C27` for primary text, `#F8F7F8` for the page gray, `#FFF7E5` for cream sections, and `#FFFFFF` for cards.
- Use `#D37BFF`, `#FF82E1`, `#FCAC84`, and `#80AAFD` as the main purple, pink, orange, and blue accents. Reserve `#F82A2D` and `#FF464F` for red/error or strong accent treatments.
- Use `#E9E9E9`, `#EDECEF`, `#EDEBE9`, and `#F6F5F4` for borders and neutral surfaces.
- For the signature gradient, use `linear-gradient(120deg, #F0E9F7, #D588FC 61%, #FF49D4)`.

If these values should become editable HubSpot theme settings, add them to root `fields.json`, map them through the `theme` object in the global stylesheet, and then consume the resulting CSS variables from modules. Do not scatter the Webflow hex values through module markup.

## Reuse the downloaded reference assets

- Look in `css/elements/Assets/images`, `css/elements/Assets/icons`, and `css/elements/Assets/video` before downloading or recreating Fluentic media.
- Consult `css/elements/Assets/asset-manifest.csv` when the original Webflow CDN source is needed.
- Prefer the original asset listed in the manifest over a responsive Webflow `srcset` rendition.
- When adding new downloaded reference media, preserve a clear filename, place it in the matching type folder, and add its source URL to the manifest.

## Build Webflow-reference modules

- Capture the exact reference section structure, default copy, media, desktop proportions, and responsive transitions before implementing it.
- Put new editable modules in `modules/<name>.module/` with `meta.json`, `fields.json`, `module.html`, `module.css`, and `module.js`.
- Make page modules non-global, available for new content, and compatible with HubSpot `PAGE` templates and the `LANDING_PAGE`/`SITE_PAGE` content types.
- Group section-level content separately from repeatable card/item fields. Use repeaters when editors need to add, remove, reorder, or update cards.
- Reference bundled theme media through `get_asset_url` and allow an image field to override the bundled default.
- Scope module CSS with `{% require_css %}` and `{% scope_css %}` so multiple DnD instances can coexist safely.
- Import `/Fluentic/Macros/Button.html` as `btn_macros` and use `btn_macros.eyebrow_label(...)` for module eyebrow badges instead of recreating their markup or styles.
- Render every module button through `/Fluentic/Macros/Button.html`; never hand-code module button markup. Use `btn_macros.animated_button(...)` for black buttons (base variant) and `btn_macros.secondary_button(...)` for white buttons (variant 2).
- For dark reference CTA panels, use the shared eyebrow macro and the light `btn_macros.secondary_button(...)` variant, with editor-controlled content and links.
- Consume global CSS variables for colors, fonts, typography sizes, font weights, borders, and container width. Keep section-specific measurements local to the module.
- Use `var(--text-primary)` for module paragraph text by default. Only use secondary/muted paragraph colors when the user explicitly requests that hierarchy.
- Add JavaScript only when required for the requested behavior; prefer CSS for purely visual states and use scoped module scripts for scroll-driven sequences.

## Refine image cards and GSAP reveals

- Use a fixed wrapper `aspect-ratio` plus `object-fit: cover` when arbitrary uploads must share one crop. Exception: preserve natural image proportions when reference assets were deliberately exported with matching heights and different widths for an asymmetric card grid; explicitly stretch grid items and cards so each row still has equal outer card heights.
- GSAP core and ScrollTrigger are already loaded in `templates/layouts/base.html`; module scripts should register and use them without adding another CDN import.
- Scope animation queries to each module instance and mark initialized instances to avoid duplicate timelines in DnD pages.
- For split-word headings without GSAP SplitText, preserve the escaped heading text and wrap its words with DOM-created spans before applying a staggered reveal.
- Reveal visual card rows with separate ScrollTriggers so later rows wait until they reach the viewport. Treat each card as a row on mobile where the grid is one column.
- For header elements that should feel nearly simultaneous but ordered, overlap their GSAP timeline positions with short offsets instead of waiting for each tween to finish before starting the next one.
- Guard motion with `prefers-reduced-motion: no-preference`; the unanimated HTML/CSS state must remain fully visible when animation is unavailable.

## Animate CTA modules

- Reuse `btn_macros.eyebrow_label` and the appropriate global button macro; wrap macro output with scoped data attributes when it needs to participate in a module timeline.
- Use an editable HubSpot image field for CTA panel artwork and apply its URL through a scoped CSS custom property. Do not substitute a text-color token as the panel background when artwork is the intended design.
- Reuse the solution-section split-word timing for CTA copy: badge first, words shortly after, then the button, with overlapping absolute timeline positions.
- For continuously rotating CTA artwork, use positive GSAP Z rotation (`rotation: "+=360"`) with linear easing, `force3D`, `transform-style: preserve-3d`, and `will-change: transform`.

## Build blog-card modules

- Use a repeater group for editor-controlled cards and set its `occurrence.max` to the requested card limit.
- HubSpot's `blog` field selects a blog source, not an individual post. For a live-content card picker, pair the blog field with a bounded post-position number (`1` = newest) and retrieve that item with `blog_recent_posts(blog_id, position)`.
- Pull the card URL, featured image and alt text, first topic, publish date, and title from the returned post object so published blog content remains the source of truth.
- Use the current `format_datetime` filter for publish dates; do not add new uses of the deprecated `datetimeformat` filter.
- Keep image hover effects in CSS, include keyboard focus behavior, and respect `prefers-reduced-motion`; do not add JavaScript for a simple zoom effect.
- For the Fluentic Blog-section heading reveal, put `gsap_split_word` on the heading and `gsap_split_word1` on its generated word spans, then stagger those words upward from below.
- Keep the Explore All control macro-driven and animate its wrapper rather than modifying the shared button markup.
- Derive reveal row size from the responsive grid: three cards at desktop, two at tablet, and one at mobile. Give each visual row its own ScrollTrigger.

## Replace global modules safely

- Before replacing a global module, find every template/partial reader and preserve the deployed folder path, module label, and existing `module_id` unless a new remote module is explicitly required.
- Keep the outer semantic landmark owned by the global partial. For example, `templates/partials/footer.html` owns the `<footer>` element, so `Global/Footer.module` renders `<section class="footer">` rather than nesting another `<footer>` landmark.
- Bundle default logos and artwork with the theme and resolve them through `get_asset_url`; image fields should override those defaults.
- Keep global navigation, social, brand, wordmark, and legal content editor-controlled through grouped and repeatable fields.
- Preserve a rollback path through version control and do not upload the replacement until the user explicitly requests deployment.
