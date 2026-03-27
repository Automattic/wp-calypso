# AGENTS.md

## Repository layout

- client/ — main application clients, deployed as single-page React apps.
- packages/ — shared libraries across clients.
- apps/ — standalone mini-apps, deployed separately.

## Clients

- **Calypso** — the classic WordPress.com hosting dashboard, sharing data using Redux and split via Webpack section chunks.
  - client/my-sites — per-site management; deprecated in favor of the Dashboard client
  - client/my-sites/checkout — checkout flow
  - client/me/purchases — purchase management
  - client/landing/stepper — onboarding/signup flows (site creation, domain purchase, migration wizards)
  - client/reader — WordPress.com Reader: feed streams, discover, conversations, likes, lists, following management
  - Shared infra: client/components, client/state, client/lib, client/layout
- **Jetpack Cloud** (client/jetpack-cloud) — reuses Calypso shared infra (client/state, client/components).
- **A8C for Agencies** (client/a8c-for-agencies) — reuses Calypso shared infra.
- **Dashboard** (client/dashboard) — the new multi-site dashboard. Self-contained: does not reuse Calypso client code. Has its own components, data fetching (TanStack Query), and routing (TanStack Router).
  - client/dashboard/me/billing-purchases — billing & purchase management

## Packages

- **Help Center** (`packages/help-center`) — shared component library for WordPress.com support. Also deployed via `apps/help-center/` to `widgets.wp.com`.
- **Image Studio** (`packages/image-studio`) — AI-powered image editing and generation
- **Block Notes** (`packages/block-notes`) — AI-powered block commenting system for WordPress

## Apps

- **Help Center** (`apps/help-center`) — build/deploy layer that bundles `packages/help-center` into webpack entry points served from `widgets.wp.com`.

## Development

```bash
# Setup
yarn install

# Build and start the dev server
yarn start

# Build and start the dev server for the Dashboard client only.
yarn start-dashboard
```

## Testing instructions

> **Note**: E2E tests require a local Calypso development instance to be running.

```bash
# JavaScript tests
yarn test                                       # Run unit tests for client, packages, server, and build-tools
yarn test-build-tools                           # Run unit tests for build-tools
yarn test-client                                # Run unit tests for client
yarn test-integration                           # Run integration tests
yarn test-apps                                  # Run apps unit tests
yarn test-packages                              # Run packages unit tests
yarn test-server                                # Run server unit tests
yarn test-server:coverage                       # Run server unit tests with coverage info

yarn test-client:watch                          # Run unit tests for client in watch mode
yarn test-client <path_to_test_directory>       # Run client unit tests from a specific directory
yarn test-client --testNamePattern="<TestName>" # Run a specific client unit test

# E2E tests - refer to: test/e2e/AGENTS.md

# Code Quality
yarn lint           # Lint everything
yarn lint:css       # Lint CSS
yarn lint:js        # Lint JavaScript
yarn reformat-files # Fix formatting with Prettier
```

## Creating Pull Requests

- Create PRs as draft. Follow the template in .github/PULL_REQUEST_TEMPLATE.md.
- Follow the branch naming conventions in docs/git-workflow.md.
- In the PR description:
  - Use Linear issue IDs (e.g., `LIN-123`) instead of full Linear URLs.
  - Avoid mentioning people's names.
  - Do not link to wordpress.com URLs.
  - Include all checklist items from .github/PULL_REQUEST_TEMPLATE.md. Only mark items as completed (`[x]`) if they actually apply; leave inapplicable items unchecked (`[ ]`).

## Cursor Cloud specific instructions

### Hosts file entries

The dev server requires these `/etc/hosts` entries (already configured in the VM snapshot):

```
127.0.0.1 calypso.localhost
127.0.0.1 my.localhost
127.0.0.1 my.woo.localhost
```

If missing, add them before starting any dev server.

### Starting the dev server

- `yarn start` — full Calypso (all clients). Builds packages, compiles webpack, and starts Express on port 3000. First build takes ~2-3 minutes.
- `yarn start-dashboard` — Dashboard client only (faster, limits webpack entries). Served at `http://my.localhost:3000/`.
- The Dashboard environment config uses hostname `my.localhost` (not `calypso.localhost`). The root URL `/` redirects to the WordPress.com login page when unauthenticated — this is expected.
- Webpack hot-reloading is enabled; after the initial build completes ("Ready! All assets are re-compiled"), incremental rebuilds take ~5-10 seconds.

### Running tests

- Use scoped test commands for faster feedback: `yarn test-client <path>` or `yarn test-packages <path>`.
- Full `yarn lint` runs all linters sequentially (`lint:config-defaults`, `lint:css`, `lint:js`, `lint:mixedindent`, `lint:unused-state-action-types`). For quick checks, run `yarn lint:js` or `yarn lint:css` directly.
- The `.env` file does not exist and the "Failed to load ./.env" warning on startup is benign.

### Node.js version

This project requires Node.js 22.9.0 (pinned in `.nvmrc`). The update script handles version switching via nvm.
