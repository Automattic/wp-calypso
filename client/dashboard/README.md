# Multi-site Dashboard

This is the new hosting dashboard for WordPress.com. It serves the WordPress.com dashboard (at my.wordpress.com) and Commerce-in-a-Box dashboard (CIAB, at my.woo.ai).

This dashboard uses TanStack Query and TanStack Router.

## Some principles

- If hacks are used, document them in the README and propose a long term solution.
- Performance testing and e2e testing are key.
- Document all the architecture decisions.

## Documentation

- [Running Dev Server](./docs/dev-server.md) - running the development server
- [Router and Routes](./docs/router.md) - the routing system based on @tanstack/react-router
- [Data Library and Layer](./docs/data-library.md) - the data fetching and state management approach
- [UI Components](./docs/ui-components.md) - the component architecture and design principles
- [Testing Strategy](./docs/testing.md) - the testing approach and best practices
- [Entry Points](./docs/entry-points.md) - the entry points and how to define new ones (a4a, WordPress.com, etc.)
- [Internationalization](./docs/i18n.md) - internationalization and translation practices
- [Typography and Copy](./docs/typography-and-copy.md) - typography guidelines and copy standards
- [Package Imports](./docs/package-imports.md) - package import restrictions and policy

## Bugs

- Importing SASS files bring unexpected CSS variables to our bundles (e.g., --masterbar-height, --sidebar-width), it also brings fonts (Recoleta, Noto) and some global classes. Why? Imports should ideally be explicit.

## Hacks

- `client/dashboard/plugins/scheduled-updates/index.tsx`: Grouping by a field in the core `DataViews` component uses `getValue` to display the grouping header. To group by a value but display something else in the header, we're generating an ID containing a unique number of zero-width space characters. This should be removed once we're able to edit the header value.

## E2E testing

### Currently

We're using Calypso's existing infrastructure, which separates the actual tests (`specs`) from so-called "page objects" (and optionally "components"). The latter represent pages (e.g. `DashboardPage`) with specific methods for interaction and inspection:

- test/e2e/specs/dashboard/
- packages/calypso-e2e/src/lib/pages/dashboard-page.ts

The setup itself lacks centralised documentation, IMO, particularly around decrypting the secrets necessary to letting Playwright run Calypso. What we get in return is a system that has already solved many problems (user authentication, etc.).

### Sharing components with the hosting dashboard v1

As we iterate on the new dashboard, we may want to share components with the existing hosting dashboard v1. The idea is to ship new screens and redesigns sooner in the existing dashboard, while we work on the new one. This is a temporary solution until we can fully migrate to the new dashboard.

The new Hosting Dashboard has stricter guidelines (see above) and ESlint rules, for this reason, the shareable components are currently build within the new dashboard. This is not the ideal solution but a pragmatic one.

Shared components:

- `client/dashboard/sites/add-new-site/` - Add new site dropdown/modal content.
