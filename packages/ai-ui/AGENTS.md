# AI UI

This package owns the reusable A2UI v0.9 WordPress catalog and surface renderer.
Keep it independent of Agents Manager, Agenttic message types, and MCP transport.
Consumers own session lifetime, message parsing, loading, and action delivery.

Export the consumer API from `src/index.ts`; keep component implementations
internal. Use `@wordpress/element` for React APIs and WordPress components and
icons for UI. Styles use the `automattic-interactive-ui` prefix and plain CSS so
consumers do not need Sass. Host-specific stacking rules belong to consumers.
Use the WordPress `default` domain for translated fallback labels.

Build with `yarn workspace @automattic/ai-ui build`. Run existing tests
with `yarn jest --config packages/ai-ui/jest.config.js --runInBand`.
Changes also affect Agents Manager: check its tests and the package/client
type-checks. Preserve the catalog's schemas, bindings, and actions when moving
code; do not add transport behavior here.
