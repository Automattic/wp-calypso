import { getJetpackProductsIncludesInfo } from './translations';
import type { Product } from './types';
/**
 * Get Jetpack product "Includes" info based on the product purchase object.
 */
export function getJetpackProductIncludesInfo( product: Product ) {
	const jetpackProductsIncludesInfo = getJetpackProductsIncludesInfo();
	return jetpackProductsIncludesInfo[ product.product_slug ];
}
