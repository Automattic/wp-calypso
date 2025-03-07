import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const USE_PRODUCTION_SITE_DETAIL_QUERY_KEY = 'production-site-detail';

export interface ProductionSite {
	id: number;
	name: string;
	url: string;
}

type ProductionSiteOptions = Pick< UseQueryOptions, 'enabled' >;

interface ErrorResponse extends Error {
	code?: string;
}

export const useProductionSiteDetail = ( siteId: number, options: ProductionSiteOptions ) => {
	return useQuery< ProductionSite, ErrorResponse, ProductionSite >( {
		queryKey: [ USE_PRODUCTION_SITE_DETAIL_QUERY_KEY, siteId ],
		queryFn: () =>
			wp.req.get( {
				path: `/sites/${ siteId }/staging-site/production-site-details`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId && ( options.enabled ?? true ),
		meta: {
			persist: false,
		},
		staleTime: 10 * 1000,
	} );
};
