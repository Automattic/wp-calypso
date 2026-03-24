# Agents Manager App

Build and deployment layer for the Agents Manager. Most code lives in `packages/agents-manager/` — see its `AGENTS.md` for architecture and conventions.

This app bundles the package into 8 webpack entry points deployed to `widgets.wp.com/agents-manager/`. Jetpack enqueues these on Simple, Atomic, and CIAB sites.

## Build & Sync

```bash
# Dev build + sync to sandbox
cd apps/agents-manager
yarn dev --sync

# Production build
yarn build
```

The `--sync` flag syncs bundles to `widgets.wp.com/agents-manager/` on your sandbox.

## Sandbox Testing

1. Sandbox `widgets.wp.com` (the sites themselves do not need sandboxing).
2. Run `yarn dev --sync` from this directory.
3. Visit any Simple, Atomic, or CIAB site.
4. Open the Agents Manager and verify your changes.

## Pitfalls

- **`wp-admin` entry point is dual-mode**: It renders full UI when `#agents-manager-masterbar` exists, otherwise runs headless (for Image Studio shared use). This is not obvious from the filename.
- **`image-studio` and `block-notes` are separate bundles**: They're built here but are independent features, not part of the main Agents Manager UI.
