/**
 * Internal dependencies
 */
import { YOAST_SEO } from './constants';
import { formatProduct } from './format-product';

export function isMarketplaceProduct( product ) {
	product = formatProduct( product );

	return product.product_slug === YOAST_SEO;
}
