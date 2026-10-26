# AI UI Renderer

A shared component library for A2UI v1.0: the Basic catalog's components and shared rendering
primitives. Don't add a custom component here; it belongs in its owner's project, in its own catalog
that `createInteractiveUiCatalog()` builds. Keep chat message handling, session lifetime, and MCP
transport in consumers. See README.md for usage and build commands, and
`packages/agents-manager/src/interactive-ui/README.md` for the architecture.

Code lives in `components/` (`InteractiveUiSurface` and the Basic catalog's components), `contexts/`
(each read through its `use…()` hook), `hooks/` and `utils/`. `index.ts` is the public API, and
`capabilities.ts` is the entry hosts load before the renderer, so it must import no A2UI or React.

Name CSS classes BEM-style under the `ai-ui-renderer` block, with kebab-case modifiers
(`ai-ui-renderer__image--small-feature`); `kebabCase()` turns A2UI's enum values into them, and
`clsx()` joins conditional ones. `InteractiveUiSurface` owns the styled root and shares its disabled
state, which the components that change something read: inputs, and buttons that run an action.
Style colors with A2UI's `--a2ui-*` tokens and their defaults, keeping `THEME_PROPERTIES` in
`utils/theme.ts` in sync with `style.scss`. Keep host-specific chat isolation, token values and
modal stacking rules in consumers.

WordPress UI components come from `@wordpress/ui` and load their own styles. `style.scss` maps the
A2UI theme onto their `--wpds-*` design tokens and uses the host's WordPress component colors as
fallbacks. wp-admin and the editor also set those tokens' sizes and type from their Gutenberg copy,
so check a theme change in Calypso and wp-admin, in light and dark mode. Add or change a component
as README.md's "Adding a component" says.
