# Router and Route Management

> [!IMPORTANT]
> The dashboard is migrating to file-based routing. For where routes live, how to add one, and the data-loading rule, follow [file-based-routing.md](./file-based-routing.md). Parts of this page describe the old code-based setup.

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

later the component reads the data with `useSuspenseQuery`. It's already cached, so it doesn't suspend:

```typescript
const { data: profile } = useSuspenseQuery( userSettingsQuery() );
```

## Adding New Routes

See [file-based-routing.md](./file-based-routing.md#conventions). New routes go in a route file under `client/dashboard/routes/`.

## Authorization and Protection

By default, the whole dashboard is protected and the user must be logged in to access it. But some routes (like the profile page) require additional authorization checks. For these routes, you can use the `beforeLoad` hook to check if the user has the necessary permissions.

```typescript
beforeLoad: async () => {
  const twoStep = await fetchTwoStep();
  if ( twoStep.two_step_reauthorization_required ) {
    window.location.href = reauthRequiredLink();
  }
},
```
