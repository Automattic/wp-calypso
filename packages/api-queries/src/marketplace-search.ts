import { fetchMarketplaceSearch } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

const MAX_PAGE_SIZE = 20;

export const marketplaceSearchQuery = ( {
	perPage,
	slugs,
	groupId = 'marketplace',
}: {
	perPage: number;
	slugs: string[];
	groupId?: string;
} ) =>
	queryOptions( {
		queryKey: [
			'marketplace-search',
			groupId,
			{ slugs: slugs.slice( 0, MAX_PAGE_SIZE ), perPage },
		],
		queryFn: () =>
			fetchMarketplaceSearch( {
				category: 'all',
				groupId,
				pageSize: Math.min( perPage, MAX_PAGE_SIZE ),
				slugs: slugs.slice( 0, MAX_PAGE_SIZE ),
			} ),
	} );
