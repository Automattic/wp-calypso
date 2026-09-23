# Survicate (wp-admin bundle)

Build and deploy layer that bundles [`packages/survicate`](../../packages/survicate) into a single script served from `https://widgets.wp.com/survicate/survicate.min.js`. wp-admin on Simple and Atomic sites enqueues it via `class-survicate.php` in the `jetpack-mu-wpcom` package of the Jetpack monorepo.

There is no logic here. `survicate.js` reads the config PHP emits on `window.wpcomSurvicateConfig` (`locale` and site-level `traits`), and hands off to the package. Anything about _how_ surveys load or get suppressed belongs in `packages/survicate`.

## Development

The bundle is ~30 KB minified, mostly `@automattic/calypso-analytics` (Tracks, for the suppression event) and `debug`.

### In Calypso

Nothing to do here: Calypso and the Multi-site Dashboard import the package directly. `yarn start` as usual.

### In Simple sites

1. Sandbox your site and `widgets.wp.com`.
2. `cd apps/survicate && yarn dev --sync` — builds on change and rsyncs `dist/` to `/home/wpcom/public_html/widgets.wp.com/survicate`.
3. Reload any wp-admin page. `localStorage.debug = 'survicate'` in the console shows the package's debug log.

### In Atomic sites

Atomic fetches the same URL, so the Simple-site steps apply for JS changes. Because Jetpack reads `survicate.asset.json` over the network from _production_, a change to the bundle's dependency list only takes effect on Atomic after a deploy.

PHP changes (eligibility, traits) live in the Jetpack monorepo; follow the [`jetpack-mu-wpcom`](https://github.com/Automattic/jetpack/blob/trunk/projects/packages/jetpack-mu-wpcom/README.md) development process.

## Testing

```bash
yarn test-apps apps/survicate
```

## Deployment

1. Merge to `trunk`. TeamCity's "Build Calypso Apps" produces `survicate.zip`.
2. On a sandbox: `install-plugin.sh survicate --release`, push the branch to the WPCOM repository when prompted, merge the resulting PR.
3. `deploy wpcom`.

Simple and Atomic pick the new bundle up on the next page load. No Jetpack release is involved unless `class-survicate.php` itself changed.
