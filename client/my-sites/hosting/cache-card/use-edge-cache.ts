import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const USE_EDGE_CACHE_QUERY_KEY = 'edge-cache-key';

export const useEdgeCacheQuery = (
	siteId: number,
	options: UseQueryOptions< boolean, unknown, boolean >
) => {
	return useQuery< boolean, unknown, boolean >( {
		queryKey: [ USE_EDGE_CACHE_QUERY_KEY, siteId ],
		queryFn: () =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/edge-cache/active`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId && ( options?.enabled ?? true ),
		select: ( data ) => {
			return !! data;
		},
		initialData: options?.initialData || false,
		meta: {
			persist: false,
		},
		onSuccess: options?.onSuccess,
		onError: options?.onError,
	} );
};
