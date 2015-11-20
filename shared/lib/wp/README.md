WP
======

Offers a shared `WPCOM` API instance to interact with the WordPress.com REST API client-side.

Calls to `wpcom` use the iframe REST proxy via `postMessage`, where authentication is handled via the user's WordPress.com authentication cookies — as opposed to OAuth.

### Undocumented Endpoints

Those API endpoints that are not yet publicly documented need to be defined as part of the `wpcom-undocumented` module. Publicly document your endpoints when their APIs are stable.
