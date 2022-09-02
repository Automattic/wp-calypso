import { getJetpackProductsFeaturedText } from './translations';
import type { Product } from './types';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product featured text based on the product purchase object.
 */
export function getJetpackProductFeaturedText( product: Product ): TranslateResult | undefined {
	const jetpackProductsFeatureText = getJetpackProductsFeaturedText() as Record<
		string,
		TranslateResult
	>;
	return jetpackProductsFeatureText[ product.product_slug ];
}
