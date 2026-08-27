[← Documentation index](./overview.md)

# Environment Variables

Environment Variables control much of the runtime configuration for E2E tests.

## Current Environment Variables

| Name                  | Description                                                                                                                                                                                  | Default                                                  | Required     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------ |
| ATOMIC_VARIATION      | Which Atomic variation to run against: `default`, `php-old`, `php-new`, `wp-beta`, `wp-previous`, `private`, `ecomm-plan`, or `mixed` to have `ATOMIC_VARIATION_KEY` pick one.               | `default`                                                | Optional     |
| ATOMIC_VARIATION_KEY  | What `ATOMIC_VARIATION=mixed` hashes to pick its variation. CI passes the commit SHA, so a re-run repeats the variation that failed; pass that same SHA to reproduce a failure locally.      | None                                                     | With `mixed` |
| CALYPSO_BASE_URL      | The base URL to use for Calypso e.g. `https://wordpress.com`, `http://calypso.localhost:3000`, etc.                                                                                          | `http://calypso.localhost:3000`                          | Optional     |
| COBLOCKS_EDGE         | Use the bleeding edge CoBlocks build.                                                                                                                                                        | `false`                                                  | Optional     |
| COOKIES_PATH          | Path on disk to the saved authenticated cookies.                                                                                                                                             | `./cookies/`                                             | Optional     |
| DASHBOARD_BASE_URL    | The base URL to use for Multi-site Dashboard e.g. `https://my.wordpress.com`, etc.                                                                                                           | `http://calypso.localhost:3000`                          | Optional     |
| GUTENBERG_EDGE        | Use the bleeding edge Gutenberg build.                                                                                                                                                       | `false`                                                  | Optional     |
| JETPACK_TARGET        | Which Jetpack install (`wpcom-production`, `wpcom-deployment`, `remote-site`) we are targeting through Calypso.                                                                              | `wpcom-production`                                       | Optional     |
| TEST_ON_ATOMIC        | Use a user with an Atomic site.                                                                                                                                                              | `false`                                                  | Optional     |
| WOO_BASE_URL          | The base URL to use for WooCommerce.com marketing pages, typically accessed when not logged in.                                                                                              | `https://woocommerce.com`                                | Optional     |
| WPCOM_BASE_URL        | The base URL to use for WordPress.com marketing pages, typically accessed when not logged in.                                                                                                | `https://wordpress.com`                                  | Optional     |
