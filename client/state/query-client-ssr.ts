import { QueryClient, QueryCache, dehydrate } from 'react-query';
import { MAX_AGE, BASE_STALE_TIME } from 'calypso/state/initial-state';
const sharedCache = new QueryCache();

export function createQueryClientSSR() {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { cacheTime: MAX_AGE, staleTime: BASE_STALE_TIME } },
		queryCache: sharedCache,
	} );

	return queryClient;
}

export function dehydrateQueryClient( queryClient?: QueryClient ) {
	if ( ! queryClient ) {
		return null;
	}
	return dehydrate( queryClient );
}
