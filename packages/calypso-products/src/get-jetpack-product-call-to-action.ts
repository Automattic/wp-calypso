/**
 * External dependencies
 */
import { TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { getJetpackProductsCallToAction } from './translations';

/**
 * Type dependencies
 */
import type { Product } from './types';

/**
 * Get Jetpack product call-to-action based on the product purchase object.
 *
 * @param {Product} product Product purchase object
 * @returns {TranslateResult} Product display name
 */
export function getJetpackProductCallToAction( product: Product ): TranslateResult | undefined {
	product = formatProduct( product );
	const jetpackProductsCallToActions = getJetpackProductsCallToAction() as Record<
		string,
		TranslateResult
	>;

	return jetpackProductsCallToActions?.[ product.product_slug ];
}
