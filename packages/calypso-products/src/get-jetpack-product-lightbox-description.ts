import { getJetpackProductsLightboxDescription } from './translations';
import type { Product } from './types';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product lightbox description based on the product purchase object.
 */
export function getJetpackProductLightboxDescription(
	product: Product
): TranslateResult | undefined {
	const jetpackProductsLightboxDescription = getJetpackProductsLightboxDescription() as Record<
		string,
		TranslateResult
	>;
	return jetpackProductsLightboxDescription[ product.product_slug ];
}
