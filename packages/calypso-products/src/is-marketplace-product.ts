/**
 * Internal dependencies
 */
import { YOAST_SEO } from './constants';
import { formatProduct } from './format-product';

export function isMarketplaceProduct( product : any ): boolean {
	product = formatProduct( product );
	return product.productSlug === YOAST_SEO;
}
