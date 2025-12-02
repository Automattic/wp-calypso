import { wpcom } from '../wpcom-fetcher';
import type { SiteProduct } from './types';

/**
 * Response from GET /sites/%s/products/
 * Returns an object with product slugs as keys
 */
export async function fetchSiteProducts(
	siteId: number
): Promise< Record< string, SiteProduct > > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/products`,
	} );
}
