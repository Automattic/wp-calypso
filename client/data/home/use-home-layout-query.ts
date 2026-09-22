import { useQuery, UseQueryResult, QueryKey, QueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useHomeLayoutQueryParams, HomeLayoutQueryParams } from './use-home-layout-query-params';

interface Options {
	enabled?: boolean;
}

const useHomeLayoutQuery = (
	siteId: number | null,
	{ enabled = true }: Options = {}
): UseQueryResult => {
	const query = useHomeLayoutQueryParams();

	return useQuery( {
		queryKey: getCacheKey( siteId ),
		queryFn: () => fetchHomeLayout( siteId, query ),
		enabled: !! siteId && enabled,

		// The `/layout` endpoint can return a random view. Disable implicit refetches
		// so the view doesn't change without some user action.
		staleTime: Infinity,
		refetchInterval: false,

		// Navigating to My Home is the user action that earns a new view, and the route
		// asks for one via `prefetchHomeLayout` before this ever mounts. Refetching on
		// mount as well would throw that request away and re-request on arrival.
		refetchOnMount: true,
	} );
};

/**
 * Requests the layout from the route, so it is in flight before My Home renders.
 *
 * `fetchQuery` without a `staleTime` always goes to the network, which is what keeps
 * a new view per navigation working now that the hook no longer refetches on mount.
 */
export function prefetchHomeLayout(
	queryClient: QueryClient,
	siteId: number | null,
	query: HomeLayoutQueryParams = {}
): Promise< unknown > {
	return queryClient.fetchQuery( {
		queryKey: getCacheKey( siteId ),
		queryFn: () => fetchHomeLayout( siteId, query ),
	} );
}

export function fetchHomeLayout(
	siteId: number | null,
	query: HomeLayoutQueryParams = {}
): Promise< unknown > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/home/layout`,
			apiNamespace: 'wpcom/v2',
		},
		query
	);
}

export function getCacheKey( siteId: number | null ): QueryKey {
	// The `dev` and `view` query params are not included in the cache key because we want all
	// the hooks to have the same idea of what the current view is, regardless of dev flags.
	return [ 'home-layout', siteId ];
}

export default useHomeLayoutQuery;
