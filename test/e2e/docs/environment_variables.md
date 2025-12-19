Return to [Top Page](../README.md).

# Environment Variables

Environment Variables control much of the runtime configuration for E2E tests.

## Current Environment Variables

| Name                  | Description                                                                                                           | Default                                             | Required |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | -------- |
| ARTIFACTS_PATH        | Path on disk to test artifacts (screenshots, logs, etc).                                                              | `./results/`                                        | Optional |
| AUTHENTICATE_ACCOUNTS | Comma-delimited list of accounts to pre-authenticate for later use.                                                   | `simpleSitePersonalPlanUser,atomicUser,defaultUser` | Optional |
| CALYPSO_BASE_URL      | The base URL to use for Calypso e.g. `https://wordpress.com`, `http://calypso.localhost:3000`, etc.                   | `http://calypso.localhost:3000`                     | Optional |
| COBLOCKS_EDGE         | Use the bleeding edge CoBlocks build.                                                                                 | `false`                                             | Optional |
| COOKIES_PATH          | Path on disk to the saved authenticated cookies.                                                                      | `./cookies/`                                        | Optional |
| DASHBOARD_BASE_URL    | The base URL to use for Multi-site Dashboard e.g. `https://my.wordpress.com`, etc.                                    | `http://calypso.localhost:3000`                     | Optional |
| GUTENBERG_EDGE        | Use the bleeding edge Gutenberg build.                                                                                | `false`                                             | Optional |
| HEADLESS              | Configure browser headless/headful mode.                                                                              | `false`                                             | Optional |
| JETPACK_TARGET        | Which Jetpack install (`wpcom-production`, `wpcom-deployment`, `remote-site`) we are targeting through Calypso.       | `wpcom-production`                                  | Optional |
| SLOW_MO               | Slow down the execution by given milliseconds.                                                                        | `0`                                                 | Optional |
| TEST_LOCALES          | The locales to target for I18N testing (see more: [supported locales](../../../packages/i18n-utils/src/locales.ts)).  | `en, es, fr`                                        | Optional |
| TEST_ON_ATOMIC        | Use a user with an Atomic site.                                                                                       | `false`                                             | Optional |
| VIEWPORT_NAME         | Specify the viewport to be used.                                                                                      | `desktop`                                           | Optional |
| WOO_BASE_URL          | The base URL to use for WooCommerce.com marketing pages, typically accessed when not logged in.                       | `https://woocommerce.com`                           | Optional |
| WPCOM_BASE_URL        | The base URL to use for WordPress.com marketing pages, typically accessed when not logged in.                         | `https://wordpress.com`                             | Optional |
