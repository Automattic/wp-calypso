# WP

Offers a shared `WPCOM` API instance to interact with the WordPress.com REST API.

Can be configured to use one of the following authentication methods:

## 1 Client-side

Calls to `wpcom` use the iframe REST proxy via `postMessage`, where authentication is handled via the user's WordPress.com authentication cookies — as opposed to OAuth.

## 2 Server-side, or Client-side with `oauth` feature flag

Uses the [`wpcom-xhr-request`](https://github.com/Automattic/wpcom-xhr-request) library to communicate with the API endpoints after OAuth authentication.

## Undocumented Endpoints

Those API endpoints that are not yet publicly documented need to be defined as part of the `wpcom-undocumented` module. Publicly document your endpoints when their APIs are stable.
