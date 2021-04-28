/**
 * Internal dependencies
 */
import { JETPACK_SEARCH_PRODUCTS } from './index';
import { formatProduct } from './format-product';

export function isJetpackSearch( product ) {
	product = formatProduct( product );

	return JETPACK_SEARCH_PRODUCTS.includes( product.product_slug );
}
