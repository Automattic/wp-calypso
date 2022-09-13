import { getJetpackProductsRecommendedFor } from './translations';
import type { Product } from './types';
/**
 * Get Jetpack product "Recommended For" based on the product purchase object.
 */
export function getJetpackProductRecommendedFor( product: Product ) {
	const jetpackProductsRecommendedFor = getJetpackProductsRecommendedFor();
	return jetpackProductsRecommendedFor[ product.product_slug ];
}
