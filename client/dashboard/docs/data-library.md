# Data Library and Layers

## Overview

The dashboard uses a light approach to data fetching and state management. It leverages [TanStack Query](https://tanstack.com/query) (formerly React Query) for server state management and avoids Redux in favor of a more direct, hooks-based approach.

## Architecture

The data library is organized around these key principles:

1. **REST API-centric**: All data is fetched from the WordPress.com REST API
2. **Type safety**: Strong TypeScript types for all data structures
3. **Data separation**: Clear separation between fetching logic and UI components
4. **Caching**: Simple caching strategies for optimized performance: Load from local cache first and refetch on navigation/focus.
5. **Loader pattern**: Data is prefetched through route loaders where possible

The data library consist of two layers:

- data source
- data queries (with state management)

## Data source: `client/dashboard/data/`

This layer exports the API integration with the REST API, and the data types that are consumed by the dashboard components.

### API integration

The data source layer uses `wpcom` from `calypso/lib/wp` for REST API calls. Each data requirement has corresponding fetch functions in `client/dashboard/data/<endpoint-group>.ts`. For example:

`client/dashboard/data/site-reset.ts`:
```typescript
export async function fetchSiteResetStatus( siteId: number ): Promise< SiteResetStatus > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/reset-site/status`,
		apiNamespace: 'wpcom/v2',
	} );
}
```

We usually return the raw response from the API. If you need to process the response (e.g. filter), you can do so in the data fetching layer via TanStack's [select](https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations#select) option.

### Data types

The data source layer defines clear TypeScript interfaces for the data structures returned / consumed by the endpoints, in the same file as the fetch functions. For example:

`client/dashboard/data/site-reset.ts`:
```typescript
export type SiteResetStatus = {
	status: 'in-progress' | 'ready' | 'completed';
	progress: number;
};
```

An "index" `client/dashboard/data/types.ts` is provided, which re-exports all data types from all endpoints. This allows for easy import of all data types from the dashboard components.

## Data queries (fetching and mutation): `client/dashboard/app/queries/`

The dashboard uses a combination of route loaders and component-level queries to fetch data, all using TanStack Query. This allows for both prefetching data for routes and fetching data on-demand within components.

### Route loaders

The primary data-fetching pattern uses route loaders to prefetch data before rendering components:

```typescript
const siteSettingsPHPRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/php',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( canViewPHPSettings( site ) ) {
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

At the component level, we use the `useQuery` hook to fetch data. This includes the data that we preloaded in the route loader:


```typescript
const { data: currentVersion } = useQuery( {
	...sitePHPVersionQuery( site.ID ),
	enabled: canViewPHPSettings( site ),
} );
```

as well as data that are specific to a component or that need more dynamic control:

```typescript
const { data: siteContentSummary } = useQuery(
	siteResetContentSummaryQuery( site.ID )
);
```

### Queries centralization

Queries are reused between loaders and components. To encourage cache reusability between different parts of the app, we centralize the queries definitions in the `client/dashboard/app/queries/` directory.

## Adding new data sources

To add a new data source to the dashboard:

1. Create fetch functions and related types in `client/dashboard/data/<endpoint-group>.ts`.
3. Define a new query in `client/dashboard/app/queries/` if needed.
4. Use the query in a router loader or component.

### Example: adding a new data entity

`client/dashboard/data/entity.ts`:
```typescript
// Define the type
export interface NewEntity {
  id: string;
  name: string;
  // other properties...
}

// Create the fetch function
export async function fetchNewEntity( id: string ): Promise< NewEntity > {
  return wpcom.req.get( {
    path: `/entity/${id}`,
    apiNamespace: 'rest/v1.1',
  } );
}
```

`client/dashboard/app/queries/entity.ts`:
```typescript
// Define the query
export const newEntityQuery = ( id: string ) => ( {
	queryKey: [ 'newEntity', id ],
	queryFn: () => fetchNewEntity( id ),
	staleTime: 5 * 60 * 1000, // 5 minutes
} );
```

```typescript
// Use in a component
const { data, isLoading, error } = useQuery( newEntityQuery( id ) );

// Use in a route loader
loader: ( { params: { id } } ) =>
  queryClient.ensureQueryData( newEntityQuery( id ) ),
```
