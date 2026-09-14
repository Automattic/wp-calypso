# Jetpack Connect

The user-facing flows that connect a self-hosted WordPress site to WordPress.com via the Jetpack Connection package (authorize, login, signup, install, SSO). Most surfaces here render under `/jetpack/connect/*` and are entered from a redirect emitted by the Jetpack plugin running on a remote site.

## Sub-area guides

- **`connection-content/`** — Plugin-aware copy, logo, subtitle, and feature-card system that powers the unified `from=jetpack-connector` flow. See [`connection-content/README.md`](./connection-content/README.md) for the step-by-step on registering a new plugin (slug → family → cards → subtitles).

## Flow routing

The authorize page (`authorize.jsx`) chooses its visual treatment from the `from` query parameter on the URL. The high-level branches:

- `from=jetpack-connector` — unified connector flow (`renderContent()` connector branch). Plugin-aware via `connection-content/`. The only branch that supports secondary connections (see signal table below).
- `from=jetpack-onboarding` — unified flow (no plugin-aware cards), shares wrapper with the connector branch via `isUnifiedConnectionFlow()`.
- `from=my-jetpack`, `from=connect-after-checkout` — legacy My Jetpack connect/reconnect surfaces.
- `from=woocommerce-core-profiler`, `from=woocommerce-onboarding`, `from=woocommerce-services-auto-authorize`, `from=woocommerce-setup-wizard`, plus any `wooDnaConfig().isWooDnaFlow()` match — Woo JPC / Woo DNA flows.
- `from=sso` — Jetpack SSO authorize handshake.
- Per-plugin redirects (`jetpack-boost*`, `jetpack-backup*`, `jetpack-search*`, `jetpack-social*`, `jetpack-videopress*`, `blaze-ads*`, `automattic-for-agencies-client*`, `jpo*`, `connection-ui*`, `jetpack-partner-coupon*`, `wpcom-migration*`) — handled with dedicated `isFrom…()` helpers in `authorize.jsx`; most are pass-through redirects to wp-admin after authorize.
- Anything else — default Calypso authorize card (`jetpack-connect__logged-in-card`).

When adding a new `from` value, prefer extending the unified `jetpack-connector` flow (and adding the plugin to `connection-content/`) over creating a new `isFrom…()` branch.

## Authorize-page signals

Two URL signals shape the authorize page's behavior. Keep them straight when editing `authorize.jsx`, `utils.js`, or `schema.js`:

| Signal                  | Emitted by                                                      | Calypso prop                  | Meaning                                                                               | Consumers                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------- | --------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `already_authorized=1`  | `Webhooks::handle_connect_url_redirect()` in the Jetpack plugin | `authQuery.alreadyAuthorized` | The current WP user is already linked to a wpcom account (re-entry path).             | `renderNotices()` blocking `ALREADY_CONNECTED_BY_OTHER_USER` notice, `handleSubmit()` "go back" branch, `getButtonText()` "Go back to your site" label, `getScreenReaderAuthMessage()` early-return that intentionally suppresses SR status text in this branch (paired with the button label), `UNSAFE_componentWillReceiveProps()` auto-redirect for users already on the sites list. |
| `has_connected_owner=1` | `Manager::get_authorization_url()` in the Jetpack plugin        | `authQuery.hasConnectedOwner` | The site has any connection owner (the viewing WP user may or may not be that owner). | `isSecondaryConnection()` gate that flips the connector branch into secondary content (`getSecondaryAuthCopy()`, `getSecondaryAdminFeatureCards()`).                                                                                                                                                                                                                                    |

The two signals are independent — both can be set on the same URL, neither implies the other. Don't add `has_connected_owner` to non-connector gates and don't extend `already_authorized`'s reach across branches; we untangled exactly that overload, see PR #110763 / jetpack#48904.

## Commands

```bash
yarn test-client client/jetpack-connect           # Run jetpack-connect tests
yarn test-client client/jetpack-connect/test/authorize.js
yarn test-client client/jetpack-connect/connection-content/test/
yarn eslint client/jetpack-connect/<file>
```

## Conventions

Inherits everything from [`client/AGENTS.md`](../AGENTS.md). Worth restating for this directory:

- `authorize.jsx` is the existing legacy class component (`UNSAFE_componentWillMount` / `UNSAFE_componentWillReceiveProps`). When editing, preserve the `connect()` HOC + `localize()` wrapping and the `authQueryPropTypes` shape. New components added under this tree should still be TypeScript functional components.
- Authorize-query parsing is centralized: `authQueryTransformer()` in [`utils.js`](./utils.js) is the only place that turns raw query strings into `authQuery` props, and [`schema.js`](./schema.js) gates which params are accepted. Add new params in both.
- The plugin-aware copy / card / logo system has its own walkthrough — see [`connection-content/README.md`](./connection-content/README.md) before touching `connection-content/*.ts` or `feature-cards.tsx`.
- Tracks events use the `calypso_jpc_*` prefix.
