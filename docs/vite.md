# Vite dev server

`yarn start:vite` and `yarn start-dashboard:vite` start the same Express server as `yarn start` and `yarn start-dashboard`, but Vite serves the JavaScript and CSS in place of webpack. Vite doesn't bundle in development: it transforms each module when the browser asks for it, so the server is ready in seconds and edits show up without a rebuild. Production builds still use webpack, and `yarn start` stays on webpack.

```bash
yarn start:vite
yarn start-dashboard:vite
```

`yarn start:vite` serves all of Calypso, like `yarn start`. `yarn start-dashboard:vite` serves the dotcom Dashboard on `http://my.localhost:<port>` and the A4A Dashboard on `http://my.a4a.localhost:<port>`, plus the classic flows the Dashboard links into: Stepper (`/setup`), signup (`/start`), checkout and A4A signup. A4A sign-in only works on port 3000.

### Known differences

- Logged-out, server-rendered pages such as `/themes` show unstyled content for a moment: the server links the global stylesheet, and the section's styles arrive with its JavaScript.
- Jetpack Cloud and A4A have no Vite script yet; use `yarn start-jetpack-cloud` and `yarn start-a8c-for-agencies`.

If something works under `yarn start` but not under the Vite scripts, open a GitHub issue and mention the Lego team (`@Automattic/lego`).

## How it works

- `build-tools/vite/start.mjs` takes the config env (`development` or `dashboard-development`), checks the Node version, builds the workspace packages and `public/` when they're missing, builds the Node server with Vite (`build/server-vite.cjs`) and starts it. It skips the rest of `yarn start`, e.g. `build-css` and `calypso-doctor`.
- `client/server/bundler/vite.js` runs Vite in middleware mode inside Express, sharing its HTTP server for hot updates, and tells the server which files each entry loads, including the `?direct` stylesheets a server-rendered page needs before its scripts run.
- The Vite configuration lives in `build-tools/vite/`: `base.mjs` is shared with Vitest, `dev.mjs` mirrors the browser side of `client/webpack.config.js` (including the sections loader, with the sections the server config enables), and `server.mjs` mirrors `client/webpack.config.node.js`.
- The first page load after a dependency change takes longer while Vite pre-bundles dependencies into `.cache/vite/<config env>`. Delete that folder if a dependency looks stale.

## Checking for drift from webpack

While the repo has both webpack and Vite, their configurations have to resolve modules the same way, and code that only works with one of them can slip in. `yarn vite-check`, part of the "Unit tests" build, transforms every module the entries and sections of `yarn start-dashboard:vite` reach with the Vite configuration and fails on errors and on webpack-only code such as `require.context()`, `module.hot`, `require()` in ES modules, `import()` of a template literal and `process.env.X` without a define. If a change trips it on purpose, add the file to `ALLOWED` in `build-tools/vite/check.mjs`, with the reason.
