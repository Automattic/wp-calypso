# Router and Route Management

## Overview

The dashboard uses the [@tanstack/react-router](https://tanstack.router.dev/) library for routing. This is a modern, type-safe routing solution that provides a declarative API for defining routes, with support for features like nested routes, loaders, and more.

## Architecture

The router follows these key principles:

1. **Configuration-based**: Routes are created based on the `AppConfig` that's passed to the router
2. **Lazy-loaded**: Each route is lazy-loaded using dynamic imports to optimize performance
3. **Data-fetching**: Routes use loaders to prefetch necessary data while components can use Tanstack Query for secondary data fetching. Preloading loader data relies on Tanstack Query's as well in order to support local caching. The loader refreshes the data if it is stale.
4. **Nested routing**: Routes are organized hierarchically.

## Data Fetching with Loaders

Routes use loaders to prefetch data before rendering. This ensures that components have necessary data available when they mount. The implementation leverages React Query's `queryClient` for caching:

```typescript
loader: () =>
  queryClient.ensureQueryData(userSettingsQuery()),
```

later the component can use the `useQuery` hook to access the data:

```typescript
const { data: profile } = useQuery( userSettingsQuery() );
```

If a loader throws, the route renders the error page instead of the screen. Only await what the screen needs, and check access before a request that may be refused, or `.catch()` it.

## Adding New Routes

To add a new route to the dashboard:

1. Create a new component for the route in an appropriate directory.
2. Export a named `Route` component from the module (using `createLazyRoute`).
3. Import the new route in the router configuration file and complete the route configuration (e.g., `app/router/index.ts`).
4. Define loaders for any data requirements.

## Authorization and Protection

By default, the whole dashboard is protected and the user must be logged in to access it. Routes that need more than that, such as a feature flag, a plan feature or a permission, check it in `beforeLoad` and send users who don't qualify to the nearest page they can use:

```typescript
export const siteSettingsFeatureRoute = createRoute( {
	getParentRoute: () => siteSettingsRoute,
	path: 'feature',
	beforeLoad: async ( { cause, params: { siteSlug } } ) => {
		if ( cause === 'preload' ) {
			return;
		}
		// Stands for the route's own access check, which resolves to `false` if its lookup fails.
		if ( ! ( await hasAccess() ) ) {
			throw redirectAsNotAllowed( { to: siteSettingsRoute.fullPath, params: { siteSlug } } );
		}
	},
} );
```

- **Skip preloads**, so the check only runs on a real navigation, not on link hover.
- **Redirect with `redirectAsNotAllowed()` to a route's `fullPath`**, not a hand-built URL. It shows the not-allowed notice and keeps the redirect type-checked.
- **Don't let the check throw.** An error from `beforeLoad` leaves the routes below it pending forever. Treat a failed lookup as not allowed.
- **Check what the API checks.** Flags switch per environment, and dev and stage builds turn many on for every user. If the endpoints only serve some users, the guard and every link to the route need the same check, ideally from one shared helper.

For a recent two-step login, call `redirectIfTwoStepReauthRequired()` when `cause === 'enter'`; it ignores its own failures.

For current examples, search `app/router/` for `redirectAsNotAllowed`.
