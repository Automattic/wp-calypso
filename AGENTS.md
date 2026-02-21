# AGENTS.md

## Repository layout

- client/ — main application clients, deployed as single-page React apps.
- packages/ — shared libraries across clients.
- apps/ — standalone mini-apps, deployed separately.

## Clients

- **Calypso** — the classic WordPress.com hosting dashboard, sharing data using Redux and split via Webpack section chunks.
  - client/my-sites — per-site management; deprecated in favor of the Dashboard client
  - client/landing/stepper — onboarding/signup flows (site creation, domain purchase, migration wizards)
  - client/reader — WordPress.com Reader: feed streams, discover, conversations, likes, lists, following management
  - Shared infra: client/components, client/state, client/lib, client/layout
- **Jetpack Cloud** (client/jetpack-cloud) — reuses Calypso shared infra (client/state, client/components).
- **A8C for Agencies** (client/a8c-for-agencies) — reuses Calypso shared infra.
- **Dashboard** (client/dashboard) — the new multi-site dashboard. Self-contained: does not reuse Calypso client code. Has its own components, data fetching (TanStack Query), and routing (TanStack Router).

## Development

- `yarn install`
- `yarn start` to start the dev server.
- `yarn start-dashboard` to start the dev server for the Dashboard client only.

## Creating Pull Requests

- Create PRs as draft. Follow the template in .github/PULL_REQUEST_TEMPLATE.md.
- Follow the branch naming conventions in docs/git-workflow.md.
- In the PR description:
  - Use Linear issue IDs (e.g., `LIN-123`) instead of full Linear URLs.
  - Avoid mentioning people's names.
  - Do not link to wordpress.com URLs.
  - Include all checklist items from .github/PULL_REQUEST_TEMPLATE.md. Only mark items as completed (`[x]`) if they actually apply; leave inapplicable items unchecked (`[ ]`).
