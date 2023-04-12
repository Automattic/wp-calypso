import { useQuery, UseQueryOptions } from 'react-query';
import wp from 'calypso/lib/wp';

export const USE_PRODUCTION_DETAILS_QUERY_KEY = 'production-details';

export type ProductionDetails = {
	name: string;
	url: string;
	id: string;
};

export const DEFAULT_PRODUCTION_DETAILS_INFO = {
	name: '',
	url: '',
	id: '',
};

export const useProductionSiteDetailsForWpcomStaging = (
	siteId: number,
	options: UseQueryOptions
) => {
	return useQuery< ProductionDetails, unknown, ProductionDetails >(
		[ USE_PRODUCTION_DETAILS_QUERY_KEY, siteId ],
		() =>
			wp.req
				.get( {
					path: `/sites/${ siteId }/staging-site/production-site-details`,
					apiNamespace: 'wpcom/v2',
				} )
				.then( ( response: ProductionDetails ) => ( {
					...DEFAULT_PRODUCTION_DETAILS_INFO,
					...response,
				} ) )
				.catch( () => DEFAULT_PRODUCTION_DETAILS_INFO ),
		{
			enabled: !! siteId && ( options?.enabled ?? true ),
			placeholderData: DEFAULT_PRODUCTION_DETAILS_INFO,
			meta: {
				persist: false,
			},
			staleTime: 10 * 1000,
			onError: options?.onError,
		}
	);
};
