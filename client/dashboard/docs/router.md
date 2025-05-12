# Router and Route Management

## Overview

The dashboard uses the [@tanstack/react-router](https://tanstack.router.dev/) library for routing. This is a modern, type-safe routing solution that provides a declarative API for defining routes, with support for features like nested routes, loaders, and more.

## Architecture

The router is follows these key principles:

1. **Configuration-based**: Routes are created based on the `AppConfig` that's passed to the router
2. **Lazy-loaded**: Each route is lazy-loaded using dynamic imports to optimize performance
3. **Data-fetching**: Routes use loaders to prefetch necessary data while components can use Tanstack Query for secondary data fetching. Preloading loader data relies on Tanstack Query's as well in order to support local caching. The loader refreshes the data if it is stale.
4. **Nested routing**: Routes are organized hierarchically.

## Data Fetching with Loaders

Routes use loaders to prefetch data before rendering. This ensures that components have necessary data available when they mount. The implementation leverages React Query's `queryClient` for caching:

```typescript
loader: () =>
  maybeAwaitFetch(profileQuery()),
```

later the component can use the `useQuery` hook to access the data:

```typescript
const { data: profile } = useQuery(profileQuery());
```

## Adding New Routes

To add a new route to the dashboard:

1. Create a new component for the route in an appropriate directory.
2. Export a named `Route` component from the module (using `createLazyRoute`).
3. Import the new route in the router configuration file and complete the route configuration (e.g., `router.tsx`).
4. Define loaders for any data requirements.

## Authorization and Protection

By default, the whole dashboard is protected and the user must be logged in to access it. But some routes (like the profile page) require additional authorization checks. For these routes, you can use the `beforeLoad` hook to check if the user has the necessary permissions.

```typescript
beforeLoad: async () => {
  const twoStep = await fetchTwoStep();
  if ( twoStep.two_step_reauthorization_required ) {
    const currentPath = window.location.pathname;
    const loginUrl = `/reauth-required?redirect_to=${ encodeURIComponent( currentPath ) }`;
    window.location.href = loginUrl;
  }
},
```
