/**
 * External dependencies
 */
import { useQuery, UseQueryResult, QueryKey } from 'react-query';

/**
 * Internal dependencies
 */
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

	return useQuery( getCacheKey( siteId ), () => fetchHomeLayout( siteId, query ), {
		enabled: !! siteId && enabled,

		// The `/layout` endpoint can return a random view. Disable implicit refetches
		// so the view doesn't change without some user action.
		staleTime: Infinity,
		refetchInterval: false,
		refetchOnMount: 'always',
	} );
};

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
