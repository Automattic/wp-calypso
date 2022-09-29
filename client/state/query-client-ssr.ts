import { QueryClient, QueryCache, dehydrate, QueryOptions, QueryKey } from 'react-query';
import { MAX_AGE, BASE_STALE_TIME } from 'calypso/state/initial-state';
import type { Query, QueryState } from 'react-query/types/core/query';

class QueryClientSSR extends QueryClient {
	private fetchedQueryKeys: { [ hash: string ]: boolean } = {};

	addFetchedQueryKey( queryKey: string ) {
		this.fetchedQueryKeys[ queryKey ] = true;
	}

	getFetchedQueryKey( queryKey: string ) {
		return this.fetchedQueryKeys[ queryKey ];
	}
}

class QueryCacheSSR extends QueryCache {
	build< TQueryFnData, TError, TData, TQueryKey extends QueryKey >(
		client: QueryClient | QueryClientSSR,
		options: QueryOptions< TQueryFnData, TError, TData, TQueryKey >,
		state?: QueryState< TData, TError >
	): Query< TQueryFnData, TError, TData, TQueryKey > {
		const query = super.build( client, options, state );
		if ( client instanceof QueryClientSSR ) {
			client.addFetchedQueryKey( query.queryHash );
		}
		return query;
	}
}

const sharedCache = new QueryCacheSSR();

export function createQueryClientSSR() {
	const queryClient = new QueryClientSSR( {
		defaultOptions: { queries: { cacheTime: MAX_AGE, staleTime: BASE_STALE_TIME } },
		queryCache: sharedCache,
	} );

	return queryClient;
}

export function dehydrateQueryClient( queryClient: QueryClientSSR ) {
	if ( ! queryClient ) {
		return null;
	}

	return dehydrate( queryClient, {
		shouldDehydrateQuery: ( { queryHash: queryKey } ) => {
			return !! queryClient.getFetchedQueryKey( queryKey );
		},
	} );
}
