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
- We are not caching on localstorage the two step auth query. We can not caching it because if for example the token is valid for more 15 minutes and we cache it for 30 during 15 minutes the user would face issues without an easy fix. Ideally the server passes the experiation information to the client and the client invalidates its localstorage based on that.

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

### Currently

We're using Calypso's existing infrastructure, which separates the actual tests (`specs`) from so-called "page objects" (and optionally "components"). The latter represent pages (e.g. `DashboardPage`) with specific methods for interaction and inspection:

* test/e2e/specs/dashboard/
* packages/calypso-e2e/src/lib/pages/dashboard-page.ts

The setup itself lacks centralised documentation, IMO, particularly around decrypting the secrets necessary to letting Playwright run Calypso. What we get in return is a system that has already solved many problems (user authentication, etc.).

### Caveat / question

Why must Jest be passed an environment variable so that it tests on localhost and not wordpress.com? Right now we need to call `CALYPSO_BASE_URL=http://calypso.localhost:3000 yarn workspace wp-e2e-tests test -- test/e2e/specs/dashboard/`. Why is that not the default?

### Next

Consider a lighter, less abstracted way of writing tests, without page objects. I don't think the new dashboard justifies the added complexity.
