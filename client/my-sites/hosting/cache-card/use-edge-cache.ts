import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const USE_EDGE_CACHE_QUERY_KEY = 'edge-cache-key';

export const useEdgeCacheQuery = ( siteId: number, options: UseQueryOptions ) => {
	return useQuery< boolean, unknown, boolean >( {
		queryKey: [ USE_EDGE_CACHE_QUERY_KEY, siteId ],
		queryFn: () =>
			wp.req.get( {
				path: `/sites/${ siteId }/edge-cache/active`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId && ( options?.enabled ?? true ),
		select: ( data ) => {
			return !! data;
		},
		meta: {
			persist: false,
		},
		staleTime: 10 * 1000,
		onSuccess: options?.onSuccess,
		onError: options?.onError,
	} );
};
