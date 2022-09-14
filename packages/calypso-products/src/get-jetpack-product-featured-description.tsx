import { getJetpackProductsFeaturedDescription } from './translations';
import type { Product } from './types';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product featured text based on the product purchase object.
 */
export function getJetpackProductFeaturedDescription(
	product: Product
): TranslateResult | undefined {
	const jetpackProductsFeaturedDescription = getJetpackProductsFeaturedDescription() as Record<
		string,
		TranslateResult
	>;
	return jetpackProductsFeaturedDescription[ product.product_slug ];
}
