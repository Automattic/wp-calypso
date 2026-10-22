# AI UI Renderer

Shared A2UI v1.0 catalog and rendering primitives. Keep chat message handling, session lifetime,
and MCP transport in consumers. Preserve component schemas, bindings, and actions when moving
code. Only basic or shared components live here; a chat's own components live in its project and
join a catalog through `createInteractiveUiCatalog()`. See README.md for usage and build commands,
and `packages/agents-manager/INTERACTIVE-UI.md` for the architecture.

Code lives in `components/` (`InteractiveUiSurface` and the Basic catalog's components), `contexts/`
(what a surface shares with its components), `hooks/`, and `utils/` (catalogs, definitions, runtime,
shared schemas, theme, and `kebabCase()`); `index.ts` is the public API and `style.scss` the
stylesheet.

Name CSS classes BEM-style under the `ai-ui-renderer` block, with kebab-case modifiers
(`ai-ui-renderer__image--small-feature`); `kebabCase()` turns A2UI's enum values into them.
`InteractiveUiSurface` owns the styled fieldset and disabled state, including modal controls. Style
colors with A2UI's `--a2ui-*` tokens and their defaults, keeping `THEME_PROPERTIES` in
`utils/theme.ts` in sync with `style.scss`. Keep host-specific chat isolation, token values and
modal stacking rules in consumers.
