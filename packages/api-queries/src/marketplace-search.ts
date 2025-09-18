import { fetchMarketplaceSearch } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const marketplaceSearchQuery = ( slugs: string[] ) =>
	queryOptions( {
		queryKey: [ 'marketplace-search', slugs ],
		queryFn: () =>
			fetchMarketplaceSearch( {
				category: 'all',
				groupId: 'wporg',
				pageSize: slugs.length,
				slugs,
			} ),
	} );
