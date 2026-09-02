# Agents Manager App

Build and deployment layer for the Agents Manager. Most code lives in `packages/agents-manager/` — see its `AGENTS.md` for architecture and conventions.

This app bundles the package into 9 webpack entry points deployed to `widgets.wp.com/agents-manager/`. They are separate compilations sharing one `dist/`, so each entry's chunk filenames and chunk-loading global must stay entry-unique. Jetpack enqueues these on Simple and Atomic sites.

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
3. Visit any Simple or Atomic site.
4. Open the Agents Manager and verify your changes.

## Pitfalls

- **`wp-admin` entry point mounts into the admin bar**: It renders only when `#agents-manager-masterbar` exists. Admin screens with no admin bar (e.g. iframe requests) render no node, so the bundle loads and does nothing.
- **`image-studio` is a separate bundle**: It's built here but is an independent feature, not part of the main Agents Manager UI.
