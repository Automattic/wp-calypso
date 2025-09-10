import { wpcom } from '../wpcom-fetcher';
import { WooCommercePlugin } from './types';

export function fetchWooCommercePlugin( slug: string ): Promise< WooCommercePlugin > {
	return wpcom.req.get( {
		path: `/marketplace/products/${ slug }`,
		apiNamespace: 'wpcom/v2',
	} );
}
