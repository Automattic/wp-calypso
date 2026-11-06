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

If a loader throws, the route renders the error page (`app/500`) instead of the screen, even when the failed request was for data the screen could do without. Only await what the screen can't render without. For a request that may fail, such as one the user might not have permission for, check access before making it or add a `.catch()`.

## Adding New Routes

To add a new route to the dashboard:

1. Create a new component for the route in an appropriate directory.
2. Export a named `Route` component from the module (using `createLazyRoute`).
3. Import the new route in the router configuration file and complete the route configuration (e.g., `app/router/index.ts`).
4. Define loaders for any data requirements.

## Authorization and Protection

By default, the whole dashboard is protected and the user must be logged in to access it. Routes that need more than that, such as a feature flag, a plan feature or a permission, check it in `beforeLoad` and send users who don't qualify to the nearest page they can use:

```typescript
export const sitePerformanceBackendRoute = createRoute( {
	getParentRoute: () => sitePerformanceRoute,
	path: 'backend',
	beforeLoad: async ( { cause, params: { siteSlug } } ) => {
		if ( cause === 'preload' ) {
			return;
		}
		if ( ! ( await canViewApm() ) ) {
			throw redirectAsNotAllowed( {
				to: sitePerformanceFrontendRoute.fullPath,
				params: { siteSlug },
			} );
		}
	},
} );
```

- **Skip preloads.** `beforeLoad` also runs when the router preloads a route, for example when a link is hovered. Return early when `cause === 'preload'`, so the check and its requests only run on a real navigation.
- **Redirect with `redirectAsNotAllowed()`** from `app/router/redirect.ts`. It adds the `route-not-allowed` flash that the destination page shows as a notice, and turns off the view transition.
- **Redirect to a route's `fullPath`** with `params`, not a hand-built URL, so the redirect is type-checked and follows the route if its path changes.
- **Don't let the check throw.** An error thrown from `beforeLoad` leaves every route below it pending, and the router never settles to show an error screen. Catch a failed lookup and treat it as not allowed, as `canViewApm()` does. For a check that is only a shortcut, ignore the failure instead, as `redirectIfTwoStepReauthRequired()` does.
- **Check what the API checks.** A feature flag (`isEnabled()`) only switches a feature per environment, and development and stage builds turn many flags on for every user. If the feature's endpoints only serve some users, such as Automatticians, the route guard and every link or tab leading to it need the same check. Otherwise everyone else gets an error page on those builds. Keep the decision in one helper that both use, like `canViewApm()` and `useCanViewApm()` in `sites/performance/backend-access.ts`.

For routes that need a recent two-step login, call `redirectIfTwoStepReauthRequired()` from `beforeLoad` when `cause === 'enter'`.
