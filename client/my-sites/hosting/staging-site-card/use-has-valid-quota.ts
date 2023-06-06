import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const USE_VALID_QUOTA_QUERY_KEY = 'valid-quota';

export const useHasValidQuotaQuery = ( siteId: number, options: UseQueryOptions ) => {
	return useQuery< boolean, unknown, boolean >( {
		queryKey: [ USE_VALID_QUOTA_QUERY_KEY, siteId ],
		queryFn: () =>
			wp.req.post( {
				path: `/sites/${ siteId }/staging-site/validate-quota`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId && ( options?.enabled ?? true ),
		select: ( data ) => {
			return data;
		},
		meta: {
			persist: false,
		},
		staleTime: 10 * 1000,
		onError: options?.onError,
	} );
};
