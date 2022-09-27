import { QueryClient, QueryCache, dehydrate, hashQueryKey, TQueryKey } from 'react-query';
import { MAX_AGE, BASE_STALE_TIME } from 'calypso/state/initial-state';
const sharedCache = new QueryCache();

class QueryClientSSR extends QueryClient {
	fetchedQueryKeys: { [ hash: string ]: boolean } = {};

	fetchQuery( queryKey: TQueryKey, ...args: any[] ) {
		const queryHash = hashQueryKey( queryKey );
		this.fetchedQueryKeys[ queryHash ] = true;
		return super.fetchQuery( queryKey, ...args );
	}
}

export function createQueryClientSSR() {
	const queryClient = new QueryClientSSR( {
		defaultOptions: { queries: { cacheTime: MAX_AGE, staleTime: BASE_STALE_TIME } },
		queryCache: sharedCache,
	} );

	return queryClient;
}

export function dehydrateQueryClient( queryClient?: QueryClientSSR ) {
	if ( ! queryClient ) {
		return null;
	}

	return dehydrate( queryClient, {
		shouldDehydrateQuery: ( { queryHash } ) => {
			return !! queryClient.fetchedQueryKeys[ queryHash ];
		},
	} );
}
