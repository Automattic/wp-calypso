# wpcom-gutenberg-rtc

Real-time collaboration provider for the Gutenberg editor on WordPress.com. Replaces Gutenberg's default HTTP polling with a PingHub WebSocket-based transport for low-latency, push-based document synchronization and presence.

## Why This Is a Calypso App

PingHub authenticates via cookies scoped to `public-api.wordpress.com`. The Gutenberg editor runs on a different origin — the site's own domain for Atomic sites, or `*.wordpress.com` for Simple sites — so it cannot directly open a WebSocket to PingHub (the browser won't attach the cookies).

The solution is to load a hidden bridge iframe from `widgets.wp.com` that proxies WebSocket traffic via `postMessage`. This app builds and deploys the RTC bundle to `widgets.wp.com/wpcom-gutenberg-rtc/`, where Jetpack enqueues it into the editor. Because the iframe bridge handles auth, the parent page's origin (Atomic, or any Jetpack-connected site) doesn't matter. See the [rest-proxy](https://public-api.wordpress.com/wp-admin/rest-proxy/) for the list of allowed origins and their limitations.

## File Structure

| File                     | Role                                                                     |
| ------------------------ | ------------------------------------------------------------------------ |
| `src/index.ts`           | Entry point: registers the PingHub provider via `wp.hooks.addFilter`     |
| `src/types.d.ts`         | Window global type declarations                                          |
| `src/providers/pinghub/` | PingHub Yjs provider — see [its README](src/providers/pinghub/README.md) |

## Development

```bash
# Dev build + sync to sandbox
cd apps/wpcom-gutenberg-rtc
yarn dev --sync

# Production build + sync
cd apps/wpcom-gutenberg-rtc
yarn build --sync
```

Both commands use `calypso-apps-builder` to compile webpack bundles and sync them to `widgets.wp.com/wpcom-gutenberg-rtc/` on your sandbox.

## Sandbox Testing

1. Sandbox `widgets.wp.com`.
2. Run `yarn dev --sync` from `apps/wpcom-gutenberg-rtc/`.
3. Visit a Simple or Atomic site with the `wpcom-gutenberg-rtc-enabled` blog sticker.
4. Open the Gutenberg editor on a post or page.
5. Open the same post in a second browser/tab to verify real-time sync and presence.

## Deployment

1. Connect to your sandbox and run: `install-plugin.sh wpcom-gutenberg-rtc --release`
2. Merge the PR.
3. Deploy wpcom: `deploy wpcom`

## How It Works

When the editor loads, `index.ts` checks `window.wpcomGutenbergRTC.providers` for enabled providers. If `"pinghub"` is present, it registers a `ProviderCreator` via the `sync.providers` filter. See the [PingHub provider README](src/providers/pinghub/README.md) for full details on architecture, wire protocol, and reconnection.

## Externals

`@wordpress/sync` and `yjs` are resolved to `wp.sync` and `wp.sync.Y` globals respectively, to avoid bundling duplicate Yjs instances (which breaks shared document types).
