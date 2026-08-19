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

## Lessons captured from this project

- Root `fields.json` is for theme-wide editor settings; a module's own `fields.json` is for module content/style controls.
- `theme.json` metadata alone does not style a page. The settings become visible in rendered output only when a stylesheet reads them through HubL's `theme` object.
- `base.html` is the most important integration point: it loads the global CSS/JS and owns the reusable header/footer partials.
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
- Consume global CSS variables for colors, fonts, typography sizes, font weights, borders, and container width. Keep section-specific measurements local to the module.
- Add JavaScript only when required for the requested behavior. The first `solution-section.module` implementation deliberately uses none.
