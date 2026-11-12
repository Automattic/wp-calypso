# Vite dev server

`yarn start-dashboard:vite` starts the same Express server as `yarn start-dashboard-only`, but Vite serves the Dashboard's JavaScript and CSS in place of webpack. Vite doesn't bundle in development: it transforms each module when the browser asks for it, so the server is ready in seconds and edits show up without a rebuild. Production builds still use webpack.

```bash
yarn start-dashboard:vite
```

It serves the dotcom Dashboard on `http://my.localhost:<port>` and the A4A Dashboard on `http://my.a4a.localhost:<port>`. Classic Calypso routes aren't served yet; use `yarn start` for those.

## How it works

- `build-tools/vite/start.mjs` checks the Node version, builds the workspace packages and `public/` when they're missing, builds the Node server with Vite (`build/server-vite.cjs`) and starts it. It skips the rest of `yarn start`, e.g. `build-css` and `calypso-doctor`.
- `client/server/bundler/vite.js` runs Vite in middleware mode inside Express, sharing its HTTP server for hot updates, and tells the server which files each Dashboard entry loads.
- The Vite configuration lives in `build-tools/vite/`: `base.mjs` is shared with Vitest, `dev.mjs` mirrors the browser side of `client/webpack.config.js`, and `server.mjs` mirrors `client/webpack.config.node.js`.
- The first page load after a dependency change takes longer while Vite pre-bundles dependencies into `.cache/vite`. Delete that folder if a dependency looks stale.

## Keeping it working

The webpack and Vite configurations have to resolve modules the same way. `yarn vite-check`, part of the "Unit tests" build, transforms every module the Dashboard entries reach with the Vite configuration and fails on errors and on webpack-only code such as `require.context()`, `module.hot`, `require()` in ES modules, `import()` of a template literal and `process.env.X` without a define. If a change trips it on purpose, add the file to `ALLOWED` in `build-tools/vite/check.mjs`, with the reason.
