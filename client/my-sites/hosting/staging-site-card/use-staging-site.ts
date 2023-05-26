import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const USE_STAGING_SITE_QUERY_KEY = 'staging-site';

export interface StagingSite {
	id: number;
	name: string;
	url: string;
	user_has_permission: boolean;
}

export const useStagingSite = ( siteId: number, options: UseQueryOptions ) => {
	return useQuery< Array< StagingSite >, unknown, Array< StagingSite > >( {
		queryKey: [ USE_STAGING_SITE_QUERY_KEY, siteId ],
		queryFn: () =>
			wp.req.get( {
				path: `/sites/${ siteId }/staging-site`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId && ( options.enabled ?? true ),
		select: ( data ) => {
			return data;
		},
		meta: {
			persist: false,
		},
		staleTime: 10 * 1000,
		onError: options.onError,
	} );
};
