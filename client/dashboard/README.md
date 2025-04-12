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

## Suggestions

- We should have reusable packages for our logos: a4a and WordPress.com.
- We're using the CoreBadge coçponent froç automattic/components. The Badge component needs to be stabilized.

## Bugs

- Hover color for primary @wordpress/components Button component is wrong by default (if you don't define a theme/user profile).
- The need to pass `{ width: 'auto' }` to some HStack components to make them work like regular divs.
- Importing SASS files bring unexpected CSS variables to our bundles (masterbar, sidebar), it also brings fonts (Recoleta, Noto) and some global classes. Why? Imports should ideally be explicit.

## Questions

- Should we show the WP and PHP version in simple sites?
- SiteMonitorUptimeCard currently calculates uptime percentage based on days with `up` and `down`. Should we do this by calculating minutes or something else? What would be the value of a day, if a site was down for 30 minutes for example?
- Check possible nuances around `fetchSiteEngagementStats`. For example if there are needed checks for availability of stats, returned data and manipulation.
- Should we use `useQuery` inside the components or at the parent `overview` page?
- Investigate the endpoints used in `PerformanceCards`. They return info about jobs `queued|running` and we have to use `refetchInterval` until we have both results. Is there a better way to do this and use a cached value? That would solve the delayed rendering of these cards.


## E2E testing

- Why must Jest be passed an environment variable so that it tests on localhost and not wordpress.com? Right now we need to call `CALYPSO_BASE_URL=http://calypso.localhost:3000 yarn workspace wp-e2e-tests test -- test/e2e/specs/dashboard/`. Why is that not the default???
- Right now, we are following Calypso's practice of defining a DashboardPage in the calypso-e2e package and using it as the testing interface in the test suite under (`test/e2e/specs`). I'm leaning towards drastically simplifying this, but I want to give it a shot first.
