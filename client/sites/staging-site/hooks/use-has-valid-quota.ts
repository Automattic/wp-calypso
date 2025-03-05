import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const USE_VALID_QUOTA_QUERY_KEY = 'valid-quota';

type HasValidQuotaOptions = Pick< UseQueryOptions, 'enabled' >;

export const useHasValidQuotaQuery = ( siteId: number, options: HasValidQuotaOptions ) => {
	return useQuery< boolean, unknown, boolean >( {
		queryKey: [ USE_VALID_QUOTA_QUERY_KEY, siteId ],
		queryFn: () =>
			wp.req.post( {
				path: `/sites/${ siteId }/staging-site/validate-quota`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId && ( options?.enabled ?? true ),
		meta: {
			persist: false,
		},
		staleTime: 10 * 1000,
	} );
};
