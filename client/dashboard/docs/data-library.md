# Data Library and Layer

## Overview

The dashboard uses a light approach to data fetching and state management. It leverages [TanStack Query](https://tanstack.com/query) (formerly React Query) for server state management and avoids Redux in favor of a more direct, hooks-based approach.

## Architecture

The data layer is organized around these key principles:

1. **REST API-centric**: All data is fetched from the WordPress.com REST API
2. **Type safety**: Strong TypeScript types for all data structures
3. **Data separation**: Clear separation between fetching logic and UI components
4. **Caching**: Simple caching strategies for optimized performance: Load from local cache first and refetch on navigation/focus.
5. **Loader pattern**: Data is prefetched through route loaders where possible

## Core Components

### Data Types

The data layer defines clear TypeScript interfaces for all data structures in `/client/dashboard/data/types.ts`. These include:

- User and profile information
- Site data structures
- Domain information
- Email configurations
- Performance metrics
- Media storage details
- ...

The Data Layer might be slightly different that the raw data returned from the REST API endpoints. In this case, we rely on an adapter layer that transforms the temporary REST API types defined in `/client/dashboard/data/rest-api-types.ts` to the final data types used in the dashboard. This is done to ensure that the data layer is decoupled from the API and can evolve independently. It can potentially adapt to various API layers if needed later.

### API Integration

The data layer uses `wpcom` from `calypso/lib/wp` for REST API calls. Each data requirement has corresponding fetch functions in `/client/dashboard/data/index.ts`:

```typescript
export const fetchSite = async ( id: string ): Promise< Site > => {
	if ( ! id ) {
		return Promise.reject( new Error( 'Site ID is undefined' ) );
	}
	const site = await wpcom.req.get( {
		path: `/sites/${ id }?http_envelope=1&fields=ID,URL,name,icon,subscribers_count,plan,active_modules,options`,
		apiNamespace: 'rest/v1.1',
	} );
	return siteRequestObjectToSiteObject( site );
};
```

## Data Fetching Patterns

The dashboard sets uses a combination of route loaders and component-level queries to fetch data, all using TanStack Query. This allows for both prefetching data for routes and fetching data on-demand within components.

### Route Loaders

The primary data fetching pattern uses route loaders to prefetch data before rendering components:

```typescript
const siteRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteId',
	loader: ( { params: { siteId } } ) =>
		maybeAwaitFetch( {
			queryKey: [ 'site', siteId ],
			queryFn: async () => {
				const [
					site,
					phpVersion,
				] = await Promise.all( [
					fetchSite( siteId ),
					fetchPHPVersion( siteId ),
				] );
				return {
					site,
					phpVersion,
				};
			},
		} ),
	notFoundComponent: NotFound,
} ).lazy( () => import( '../site' ).then( ( d ) => d.Route ) );
```

The `maybeAwaitFetch` helper checks if data is already cached before fetching, improving performance by avoiding unnecessary requests.

### Component-Level Queries

For data needs that are specific to a component or that need more dynamic control, components can use the `useQuery` hook directly:

```typescript
const { data, isLoading, error } = useQuery( {
	queryKey: [ 'siteStats', siteId ],
	queryFn: () => fetchSiteStats( siteId ),
	staleTime: 5 * 60 * 1000, // 5 minutes
} );
```

## Adding New Data Sources

To add a new data source to the dashboard:

1. Define the TypeScript interfaces in `/client/dashboard/data/types.ts`
2. Create fetch functions in `/client/dashboard/data/index.ts`
3. Add query keys to appropriate route loaders or component queries

### Example: Adding a New Data Entity

```typescript
// 1. Define the type
export interface NewEntity {
  id: string;
  name: string;
  // other properties...
}

// 2. Create the fetch function
export const fetchNewEntity = async (id: string): Promise<NewEntity> => {
  if (!id) {
    return Promise.reject(new Error('Entity ID is undefined'));
  }
  return wpcom.req.get({
    path: `/entity/${id}`,
    apiNamespace: 'rest/v1.1',
  });
};

// 3. Use in a route loader
loader: ({ params: { id } }) =>
  maybeAwaitFetch({
    queryKey: ['newEntity', id],
    queryFn: () => fetchNewEntity(id),
  }),
```
