import { QueryClient, QueryCache, dehydrate, QueryOptions, QueryKey } from '@tanstack/react-query';
import { MAX_AGE, BASE_STALE_TIME } from 'calypso/state/constants';
import type { Query, QueryState } from '@tanstack/react-query';

const fetchedQueryHashes = new WeakMap< QueryClient, Set< string > >();

function addQueryHash( client: QueryClient, queryHash: string ) {
	let queryHashes = fetchedQueryHashes.get( client );
	if ( ! queryHashes ) {
		queryHashes = new Set();
		fetchedQueryHashes.set( client, queryHashes );
	}
	queryHashes.add( queryHash );
}

function hasQueryHash( client: QueryClient, queryHash: string ) {
	return fetchedQueryHashes.get( client )?.has( queryHash ) ?? false;
}

class QueryCacheSSR extends QueryCache {
	build< TQueryFnData, TError, TData, TQueryKey extends QueryKey >(
		client: QueryClient,
		options: QueryOptions< TQueryFnData, TError, TData, TQueryKey >,
		state?: QueryState< TData, TError >
	): Query< TQueryFnData, TError, TData, TQueryKey > {
		const query = super.build( client, options, state );
		if ( query.state.status === 'success' ) {
			addQueryHash( client, query.queryHash );
		}
		return query;
	}
}

const sharedCache = new QueryCacheSSR();

export function createQueryClientSSR() {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { gcTime: MAX_AGE, staleTime: BASE_STALE_TIME } },
		queryCache: sharedCache,
	} );

	return queryClient;
}

export function dehydrateQueryClient( queryClient: QueryClient ) {
	if ( ! queryClient ) {
		return null;
	}

	return dehydrate( queryClient, {
		shouldDehydrateQuery: ( { queryHash } ) => {
			return hasQueryHash( queryClient, queryHash );
		},
	} );
}
