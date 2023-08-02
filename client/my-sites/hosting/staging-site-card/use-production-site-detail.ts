import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const USE_PRODUCTION_SITE_DETAIL_QUERY_KEY = 'production-site-detail';

export interface ProductionSite {
	id: number;
	name: string;
	url: string;
}

export const useProductionSiteDetail = ( siteId: number, options: UseQueryOptions ) => {
	return useQuery< ProductionSite, unknown, ProductionSite >( {
		queryKey: [ USE_PRODUCTION_SITE_DETAIL_QUERY_KEY, siteId ],
		queryFn: () =>
			wp.req.get( {
				path: `/sites/${ siteId }/staging-site/production-site-details`,
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
