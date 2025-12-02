import { wpcom } from '../wpcom-fetcher';
import { MarketplaceSearch, SearchParams } from './types';
import { generateApiQueryString } from './utils';

export function fetchMarketplaceSearch( options: SearchParams ): Promise< MarketplaceSearch > {
	const queryString = generateApiQueryString( options );

	return wpcom.req.get(
		{
			path: '/marketplace/search',
		},
		{ apiVersion: '1.3', ...queryString }
	);
}
