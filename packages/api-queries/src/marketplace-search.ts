import { fetchMarketplaceSearch } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const marketplaceSearchQuery = ( {
	perPage,
	slugs,
}: {
	perPage: number;
	slugs: string[];
} ) =>
	queryOptions( {
		queryKey: [ 'marketplace-search', ...slugs, perPage ],
		queryFn: () =>
			fetchMarketplaceSearch( {
				category: 'all',
				groupId: 'marketplace',
				pageSize: perPage,
				slugs,
			} ),
	} );
