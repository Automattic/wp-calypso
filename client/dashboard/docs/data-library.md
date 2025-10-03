# Data Library

## Overview

The dashboard uses a light approach to data fetching and state management. It leverages [TanStack Query](https://tanstack.com/query) (formerly React Query) for server state management and avoids Redux in favor of a more direct, hooks-based approach.

## Architecture

The data library is organized around these key principles:

1. **REST API-centric**: All data is fetched from the WordPress.com REST API
2. **Type safety**: Strong TypeScript types for all data structures
3. **Data separation**: Clear separation between fetching logic and UI components
4. **Caching**: Simple caching strategies for optimized performance: Load from local cache first and refetch on navigation/focus.
5. **Loader pattern**: Data is prefetched through route loaders where possible

## Query definitions

We are using queries defined in the `@automattic/api-queries` package. For more details, refer to the following documentation:

- [@automattic/api-core](../../../packages/api-core/README.md) - Core data fetching functions and type definitions
- [@automattic/api-queries](../../../packages/api-queries/README.md) - TanStack Query layer built on top of api-core

## Query usage

The dashboard uses a combination of route loaders and component-level queries to fetch data, all using TanStack Query. This allows for both prefetching data for routes and fetching data on-demand within components.

Note that queries are reused between loaders and components. The cache is shared between them because they share the same `queryClient` from the `@automattic/api-queries` package.

### Route loaders

The primary data-fetching pattern uses route loaders to prefetch data before rendering components:

```typescript
const siteSettingsPHPRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/php',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.PHP ) ) {
			await queryClient.ensureQueryData( sitePHPVersionQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../sites/settings-php' ).then( ( d ) =>
		createLazyRoute( 'site-settings-php' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);
```

TanStack's `queryClient.ensureQueryData` checks if data is already cached before fetching, improving performance by avoiding unnecessary requests.

### Component-level queries

At the component level, we use the `useQuery` and `useSuspenseQuery` hooks to fetch data. This includes the data that we preloaded in the route loader:

```typescript
const { data: currentVersion } = useSuspenseQuery( {
	...sitePHPVersionQuery( site.ID ),
	enabled: hasHostingFeature( site, HostingFeatures.PHP ),
} );
```

as well as data that are specific to a component that you want to load dynamically:

```typescript
const { data: siteContentSummary, isLoading } = useQuery(
	siteResetContentSummaryQuery( site.ID )
);
```
