# Hosting Dashboard

Build a new hosting dashboard for WordPress.com based on the new design. The same dashboard with different entry points is used for different products (WordPress.com, Jetpack Clound and a4a).

## Some principles

- @wordpress/components and design system based, avoid CSS as much as possible.
- Prefer VStack, HStack over Flex components.
- Build as a separate section/url in Calypso /v2 but avoid importing Calypso's components, CSS and state.
- Be very explicit about what dependencies we include.
- Don't use Redux and calypso/state.
- Use lib/wp for REST API calls.
- Use TanStack based stack (Query and Router). Prefer using loaders over adhoc queries.
- If hacks are used, document them in the README and propose a long term solution.
- Use TypeScript, but prefer simple, concrete types.
- Use @wordpress/i18n package for translation.
- Performance testing and e2e testing are key.
- Document all the architecture decisions (design docs)

## Dashboard Design Documentation

This `docs` directory contains comprehensive design documentation for the `/client/dashboard` prototype, a new hosting dashboard for WordPress.com based on modern design principles.

- [Router and Routes](./docs/router.md) - Documentation for the routing system based on @tanstack/react-router
- [Data Library and Layer](./docs/data-library.md) - Documentation for the data fetching and state management approach
- [UI Components](./docs/ui-components.md) - Documentation for the component architecture and design principles
- [Testing Strategy](./docs/testing.md) - Documentation for the testing approach and best practices
- [Entry Points](./docs/entry-points.md) - Documentation for the entry points and how to define new ones (a4a, WordPress.com, etc.)

## Suggestions

- We should have reusable packages for our logos: a4a and WordPress.com.
- We're using the CoreBadge component from automattic/components. The Badge component needs to be stabilized.

## Bugs

- Hover color for primary @wordpress/components Button component is wrong by default (if you don't define a theme/user profile).
- The need to pass `{ width: 'auto' }` to some HStack components to make them work like regular divs.
- Importing SASS files bring unexpected CSS variables to our bundles (masterbar, sidebar), it also brings fonts (Recoleta, Noto) and some global classes. Why? Imports should ideally be explicit.

## Hacks

- We want to use the core `Badge` component but there are limitations in its functionality right now. Specifically we want a way to apply the colors (by `intent` prop), but sometimes override the used `icon`. For now we are using `TrendComparisonBadge` with some hacky css to hide the icon.

## Questions

- Should we show the WP and PHP version in simple sites?
- SiteMonitorUptimeCard currently calculates uptime percentage based on days with `up` and `down`. Should we do this by calculating minutes or something else? What would be the value of a day, if a site was down for 30 minutes for example?
- Check possible nuances around `fetchSiteEngagementStats`. For example if there are needed checks for availability of stats, returned data and manipulation.
- Should we use `useQuery` inside the components or at the parent `overview` page?
- Investigate the endpoints used in `PerformanceCards`. They return info about jobs `queued|running` and we have to use `refetchInterval` until we have both results. Is there a better way to do this and use a cached value? That would solve the delayed rendering of these cards.

## E2E testing

### Currently

We're using Calypso's existing infrastructure, which separates the actual tests (`specs`) from so-called "page objects" (and optionally "components"). The latter represent pages (e.g. `DashboardPage`) with specific methods for interaction and inspection:

- test/e2e/specs/dashboard/
- packages/calypso-e2e/src/lib/pages/dashboard-page.ts

The setup itself lacks centralised documentation, IMO, particularly around decrypting the secrets necessary to letting Playwright run Calypso. What we get in return is a system that has already solved many problems (user authentication, etc.).

### Caveat / question

Why must Jest be passed an environment variable so that it tests on localhost and not wordpress.com? Right now we need to call `CALYPSO_BASE_URL=http://calypso.localhost:3000 yarn workspace wp-e2e-tests test -- test/e2e/specs/dashboard/`. Why is that not the default?

### Next

Consider a lighter, less abstracted way of writing tests, without page objects. I don't think the new dashboard justifies the added complexity.
