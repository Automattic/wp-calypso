/**
 * Internal dependencies
 */
import { YOAST_SEO } from './constants';

export function isMarketplaceProduct( product: { productSlug: string } ): boolean {
	return product.productSlug === YOAST_SEO;
}
