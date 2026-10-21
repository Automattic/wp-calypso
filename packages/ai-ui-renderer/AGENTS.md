# AI UI Renderer

Shared A2UI v0.9 catalog and rendering primitives. Keep chat message handling,
session lifetime, and MCP transport in consumers. Preserve component schemas,
bindings, and actions when moving code. See README.md for usage and build commands.

Prefix CSS classes with `ai-ui-renderer`. `InteractiveUiSurface` owns the styled
fieldset and disabled state, including modal controls. Keep host-specific chat
isolation and modal stacking rules in consumers.
