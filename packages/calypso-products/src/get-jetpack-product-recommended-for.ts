import { getJetpackProductsRecommendedFor } from './translations';
import type { Product } from './types';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product "Recommended For" based on the product purchase object.
 */
export function getJetpackProductRecommendedFor(
	product: Product
): Array< TranslateResult > | undefined {
	const jetpackProductsRecommendedFor = getJetpackProductsRecommendedFor() as Record<
		string,
		Array< TranslateResult >
	>;
	return jetpackProductsRecommendedFor[ product.product_slug ];
}
