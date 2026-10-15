# Agents Manager

The Agents Manager provides chat, support guides, and AI-powered tools across multiple environments.

## Development

The Agents Manager runs in multiple different environments:

1. In Calypso.
2. In the multi-site Dashboard
   - in the omnibar.
3. In Simple sites
   - as a plugin to Gutenberg editor.
   - as a wpadminbar menu item.
4. In Atomic sites
   - as a plugin to Gutenberg editor.
   - as a wpadminbar menu item.
5. In the WooCommerce AI admin
   - as a standalone chat container.
6. On public blog frontends
   - as Reader Chat for logged-out visitors.

### How to develop the Agents Manager

#### In Calypso

Follow the classic Calypso development setup. Run `yarn start` and edit away. Nothing else should be needed.

#### In the Dashboard

Run `yarn start-dashboard`. Like Calypso, it imports the package source directly.

#### In Simple sites

1. cd into `apps/agents-manager`.
2. run `yarn dev --sync`.
3. Sandbox `widgets.wp.com` (the site itself does not need sandboxing).
4. Your changes should be reflected on the site live.

#### In Atomic sites

For JS and CSS changes you don't need Jetpack running: follow the Simple-site steps above.

> [!IMPORTANT]
> Adding or removing an externalized `@wordpress/*` dependency changes the `*.asset.json` files, which Jetpack's PHP reads from the server handling the request and caches for an hour, not from your synced bundle. To test such a change, sandbox the Simple site too; on Atomic and self-hosted sites it takes effect only after a deploy.

The PHP lives in Jetpack's [`projects/packages/agents-manager`](https://github.com/Automattic/jetpack/blob/trunk/projects/packages/agents-manager/README.md) package.

### Translations

The app's `translate` script builds translations into `dist/languages/`, released with the bundles to `widgets.wp.com/agents-manager/languages/`. Jetpack loads `languages/{locale}-v1.js` from there at runtime for non-English locales.

### Deployment

After every change to the Agents Manager, the development process is two parts:

#### Deploy Calypso

This simply means deploying Calypso as you normally would.

#### Deploy the Agents Manager for Jetpack consumption

1. Connect to your sandbox and run: `install-plugin.sh am --release`
2. When prompted where to push the branch, select the WPCOM repository.
3. This will create a PR on the WPCOM repository.
4. Once checks pass, merge the PR.
5. Deploy wpcom: `deploy wpcom`

This will deploy the Agents Manager app for Jetpack consumption. Along with the languages files.

> [!IMPORTANT]
> New phrases appear translated only after they are translated and the next Agents Manager release (above) is deployed: each release build fetches the latest translations.
