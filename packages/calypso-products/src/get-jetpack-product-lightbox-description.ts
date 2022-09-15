import { getJetpackProductsLightboxDescription } from './translations';
import type { Product } from './types';

/**
 * Get Jetpack product lightbox description based on the product purchase object.
 */
export function getJetpackProductLightboxDescription( product: Product ) {
	const jetpackProductsLightboxDescription = getJetpackProductsLightboxDescription();
	return jetpackProductsLightboxDescription[ product.product_slug ];
}
