# Agents Manager App

Build and deployment layer for the Agents Manager. Most code lives in `packages/agents-manager/` — see its `AGENTS.md` for architecture and conventions.

This app builds 7 webpack entry points (see `webpack.config.js`), deployed to `widgets.wp.com/agents-manager/`. They are separate compilations sharing one `dist/`, so each entry's chunk filenames and chunk-loading global must stay entry-unique. Jetpack enqueues them outside Calypso and the Dashboard: on Simple and Atomic sites, in the WooCommerce AI admin and for Reader Chat.

## Build & Sync

```bash
# Dev build + sync to sandbox
cd apps/agents-manager
yarn dev --sync

# Production build
yarn build
```

The `--sync` flag uploads the bundles over SSH to `widgets.wp.com/agents-manager/` on your sandbox, using the host `wpcom-sandbox` (set `WPCOM_SANDBOX` to use another). Releasing to production is covered in `README.md` (Deployment).

## Sandbox Testing

1. Sandbox `widgets.wp.com` (not the sites, unless `.asset.json` changes: see Pitfalls in `packages/agents-manager/AGENTS.md`).
2. Run `yarn dev --sync` from this directory.
3. Visit any Simple or Atomic site.
4. Open the Agents Manager and verify your changes.

## Pitfalls

- **`wp-admin` entry point mounts into the admin bar**: It renders only when `#agents-manager-masterbar` exists. Admin screens with no admin bar (e.g. iframe requests) render no node, so the bundle loads and does nothing.
- **Not every entry is Agents Manager UI**: `image-studio` is an independent feature, `agents-manager-gutenberg-disconnected` is a standalone editor-toolbar help link that imports nothing from `packages/agents-manager`, and `jetpack-ai-sidebar` is a provider bundle: its `jetpack-ai-sidebar.provider.mjs` is copied to `dist/` as-is and loaded through `import()`.
- **The Jetpack AI sidebar's provider exports are listed by hand**: `jetpack-ai-sidebar.js` (an IIFE) puts the provider fields it imports from `@automattic/jetpack-ai-sidebar` on `window.__JetpackAIProvider`, and its ESM wrapper, `jetpack-ai-sidebar.provider.mjs`, re-exports each one, so a new field, such as `interactiveUi`, goes in both. Export `interactiveUi` as the plain value (`export const interactiveUi = window.__JetpackAIProvider?.interactiveUi;`), not a lazy proxy like the others: Agents Manager checks, enumerates and spreads a catalog, and an empty proxy is always truthy and spreads to `{}`. Reading it when the wrapper loads is safe, unlike the race the wrapper's proxies guard against, because Jetpack registers the wrapper only on the editor surfaces where it enqueues the IIFE, which has run by the time Agents Manager imports the wrapper.
