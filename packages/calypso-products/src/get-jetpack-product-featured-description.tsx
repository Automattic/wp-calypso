import { getJetpackProductsFeaturedDescription } from './translations';
import type { Product } from './types';

/**
 * Get Jetpack product featured text based on the product purchase object.
 */
export function getJetpackProductFeaturedDescription( product: Product ) {
	const jetpackProductsFeaturedDescription = getJetpackProductsFeaturedDescription();
	return jetpackProductsFeaturedDescription[ product.product_slug ];
}
