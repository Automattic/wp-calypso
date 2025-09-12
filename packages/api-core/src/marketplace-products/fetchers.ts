import { wpcom } from '../wpcom-fetcher';
import { MarketplacePlugin } from './types';

export function fetchMarketplacePlugin( slug: string ): Promise< MarketplacePlugin > {
	return wpcom.req.get( {
		path: `/marketplace/products/${ slug }`,
		apiNamespace: 'wpcom/v2',
	} );
}
