# Fluentic HubSpot Theme Development Skill

This is the project playbook for building future HubSpot modules and templates in the Fluentic theme.

## Before editing

1. Read `memory.md` and inspect `theme.json`, root `fields.json`, `templates/layouts/base.html`, `css/main.css`, and `css/elements/global.css`.
2. Confirm the deployed theme folder name. Existing files use both `/CoreAI theme` and `/Re-board theme`; do not invent a third path.
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
{% import '/CoreAI theme/Macros/Button.html' as btn_macros %}

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

Use `/CoreAI theme/modules/<Module name>` in `dnd_module` declarations only after confirming that `/CoreAI theme` is still the remote theme folder. Keep global header/footer rendering in the base layout unless a page intentionally overrides the blocks.

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
- Existing hard-coded remote paths and stale theme names are deployment dependencies; resolve them before copying patterns into new modules.

## Match the live Fluentic visual system

When converting or extending the Webflow design, use the live reference values captured in `memory.md`:

- Use `GeneralSans` for both primary and secondary font roles, with the available 300/400/500/600/700 weights and `Arial, sans-serif` fallback.
- Use `#1B0C27` for primary text, `#F8F7F8` for the page gray, `#FFF7E5` for cream sections, and `#FFFFFF` for cards.
- Use `#D37BFF`, `#FF82E1`, `#FCAC84`, and `#80AAFD` as the main purple, pink, orange, and blue accents. Reserve `#F82A2D` and `#FF464F` for red/error or strong accent treatments.
- Use `#E9E9E9`, `#EDECEF`, `#EDEBE9`, and `#F6F5F4` for borders and neutral surfaces.
- For the signature gradient, use `linear-gradient(120deg, #F0E9F7, #D588FC 61%, #FF49D4)`.

If these values should become editable HubSpot theme settings, add them to root `fields.json`, map them through the `theme` object in the global stylesheet, and then consume the resulting CSS variables from modules. Do not scatter the Webflow hex values through module markup.
