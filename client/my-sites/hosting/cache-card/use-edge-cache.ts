import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const USE_EDGE_CACHE_QUERY_KEY = 'edge-cache-key';

export const useEdgeCacheQuery = ( siteId: number ) => {
	return useQuery< boolean, unknown, boolean >( {
		queryKey: [ USE_EDGE_CACHE_QUERY_KEY, siteId ],
		queryFn: () =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/edge-cache/active`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		select: ( data ) => {
			return !! data;
		},
		meta: {
			persist: false,
		},
	} );
};
