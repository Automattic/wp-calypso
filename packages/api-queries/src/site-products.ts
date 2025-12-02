import { fetchSiteProducts } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteProductsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'products' ],
		queryFn: () => fetchSiteProducts( siteId ),
	} );
