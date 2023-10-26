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

export const USE_STAGING_SITE_LOCK_QUERY_KEY = 'staging-site-lock';
export const useGetLockQuery = ( siteId: number, options: UseQueryOptions ) => {
	return useQuery< boolean, unknown, boolean >( {
		queryKey: [ USE_STAGING_SITE_LOCK_QUERY_KEY, siteId ],
		queryFn: () =>
			wp.req.get( {
				path: `/sites/${ siteId }/staging-site/lock`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId && options?.enabled,
		refetchInterval: options?.refetchInterval,
		cacheTime: options?.cacheTime,
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
