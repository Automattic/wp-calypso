# AI UI Renderer

Shared A2UI v1.0 catalog and rendering primitives. Keep chat message handling, session lifetime,
and MCP transport in consumers. Preserve component schemas, bindings, and actions when moving
code. Only basic or shared components live here; a chat's own components live in its project, in
its own catalog that `createInteractiveUiCatalog()` builds. See README.md for usage and build
commands, and `packages/agents-manager/src/interactive-ui/README.md` for the architecture.

Code lives in `components/` (`InteractiveUiSurface` and the Basic catalog's components), `contexts/`
(what a surface shares with its components), `hooks/`, and `utils/` (catalogs, definitions, runtime,
shared schemas, theme, and `kebabCase()`). `index.ts` is the public API, `style.scss` the
stylesheet, and `capabilities.ts` the entry hosts load before the renderer, so it imports no A2UI or
React.

Name CSS classes BEM-style under the `ai-ui-renderer` block, with kebab-case modifiers
(`ai-ui-renderer__image--small-feature`); `kebabCase()` turns A2UI's enum values into them.
`InteractiveUiSurface` owns the styled fieldset and disabled state, including modal controls. Style
colors with A2UI's `--a2ui-*` tokens and their defaults, keeping `THEME_PROPERTIES` in
`utils/theme.ts` in sync with `style.scss`. Keep host-specific chat isolation, token values and
modal stacking rules in consumers.

WordPress components come in two copies: Calypso bundles `@wordpress/components`, while wp-admin and
the editor use the page's Gutenberg copy, which may be newer. Both read some colors from the
`--wpds-*` design tokens, and `style.scss` maps the theme onto those too, so check a theme change
against both, in light and dark mode. Theme a new or changed component as README.md's "Theming a
new component" says: light and dark mode, enabled and disabled.
