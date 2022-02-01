import { getJetpackProductsCallToAction } from './translations';
import type { Product } from './types';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product call-to-action based on the product purchase object.
 *
 * @param {Product} product Product purchase object
 * @returns {TranslateResult} Product display name
 */
export function getJetpackProductCallToAction( product: Product ): TranslateResult | undefined {
	const jetpackProductsCallToActions = getJetpackProductsCallToAction() as Record<
		string,
		TranslateResult
	>;
	return jetpackProductsCallToActions[ product.product_slug ];
}
