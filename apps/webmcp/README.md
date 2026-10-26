# WebMCP browser bundle

Bundles the shared registration API from [`packages/webmcp`](../../packages/webmcp) as `window.wpcomWebMcp`. Loading the script does not register tools or replace the browser's WebMCP registry.

Calypso and Agents Manager import `@automattic/webmcp` directly. Playground integrations import `@automattic/webmcp/playground`; its dependencies stay out of this standalone bundle.

## Build

Run `yarn workspace @automattic/webmcp-app build` from the repository root. This produces `dist/webmcp.min.js` and `dist/webmcp.asset.json`, with no WordPress script dependencies.

Run `yarn workspace @automattic/webmcp-app dev --sync` to rebuild on changes and sync to a widgets sandbox.

## Loading in wp-admin

After deployment, a host can enqueue `https://widgets.wp.com/webmcp/webmcp.min.js` and use the version from `webmcp.asset.json` for cache busting. The host then calls `window.wpcomWebMcp.getWebMcpModelContext()` and supplies its tools to `createWebMcpToolRegistry()`. It must handle registration errors and dispose its registry when those tools no longer apply.

The bundle provides the API for Simple and Atomic sites. Their PHP enqueue integration is separate and is not included here.
