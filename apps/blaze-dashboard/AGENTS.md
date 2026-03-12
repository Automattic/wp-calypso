# Blaze Dashboard Standalone App

## Purpose

SPA embedded inside wp-admin (via Jetpack plugin and Blaze Ads plugin) to manage WP Blaze advertising campaigns. Not a standalone website — always rendered within a WordPress admin context.

Owned by Ads Engineering team (#ads-engineering Slack, Linear team ADS).

## Architecture

- Entry: `src/app.jsx` → boots Redux store, sets theme, registers routes via page.js with hashbang (`#!`) routing
- Most business logic lives OUTSIDE this app in `client/my-sites/promote-post-i2/` (shared with Calypso). Controllers, components, and hooks are imported from there.
- This app is a thin wrapper: config loading, theming, routing setup, page.js middleware
- Three theme modes determined by config flags: `jetpack` (default), `wpcom` (`is_running_in_blaze_plugin`), `woo` (`is_running_in_woo_site`) — see `src/themes.js`
- Setup mode (`blaze_setup_mode` config flag) redirects to `/setup/` for disconnected sites
- Gridicon: uses `no-asset` variant (SVG sprite loaded separately by Jetpack host)
- Webpack replaces `calypso/components/formatted-header` with local `src/components/generic-header`

## External Systems

- **DSP** (Demand Side Platform, `github.tumblr.net/Tumblr/a8c-dsp`): Node.js backend + React widget for campaign creation. Config keys: `dsp_stripe_pub_key`, `dsp_widget_js_src`
- **Jetpack Blaze package** (`github.com/Automattic/jetpack/tree/trunk/projects/packages/blaze`): PHP controllers that proxy all DSP API calls through Jetpack REST API (`/jetpack/v4/blaze-app/...`). Dashboard version must stay compatible with shipped blaze package version.
- **Blaze Ads plugin** (`github.com/Automattic/blaze-ads`): Standalone WP plugin that also loads this dashboard, uses Jetpack Connect + Sync modules
- **Billing**: `adpurchase.wordpress.com` (WooCommerce instance with Stripe)
- **WPCOM proxy**: For WordPress.com context, API calls go through `public-api.wordpress.com`

## Build & Deploy

- Built by TeamCity automatically on every trunk commit. Artifacts at `widgets.wp.com/blaze-dashboard/v1`
- Production release to WPCOM: SSH to sandbox → `bin/install-plugin.sh blaze-dashboard trunk --release` → push WPCOM PR → merge → deploy
- If blaze package compatibility breaks, bump version folder (v1 → v1.1, v2, etc.) and update version code in Jetpack blaze package and WPCOM `bin/install_plugin.sh`
- i18n text domain: `blaze-dashboard`

## Development

- Sandbox sync: `yarn dev --sync` (requires `wpcom-sandbox` host in `~/.ssh/config`, point `widgets.wp.com` to sandbox IP in `/etc/hosts`)
- Local with Jetpack: `BLAZE_DASHBOARD_PACKAGE_PATH=/path/to/jetpack/projects/packages/blaze yarn dev`
- Test at: `/wp-admin/tools.php?page=advertising`
- Jurassic Ninja sites work for quick testing

## Key Fieldguide Articles

- Blaze Dashboard: `fieldguide.automattic.com/blaze-dashboard/`
- Developer Onboarding: `fieldguide.automattic.com/wordpress-blaze-developer-onboarding/`
- Blaze Ads plugin: `fieldguide.automattic.com/blaze-ads/`
