import { fetchMarketplacePlugin } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const wooCommercePluginQuery = ( slug: string ) =>
	queryOptions( {
		queryKey: [ 'marketplace-products', slug ],
		queryFn: () => fetchMarketplacePlugin( slug ),
	} );
