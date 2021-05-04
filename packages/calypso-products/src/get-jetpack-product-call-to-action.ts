import { TranslateResult } from 'i18n-calypso';

import { formatProduct } from './format-product';
import type { Product } from './products-list';
import { getJetpackProductsCallToAction } from './translations';

/**
 * Get Jetpack product call-to-action based on the product purchase object.
 *
 * @param {object} product Product purchase object
 * @returns {TranslateResult} Product display name
 */
export function getJetpackProductCallToAction( product: object ): TranslateResult | undefined {
	product = formatProduct( product );
	const jetpackProductsCallToActions = getJetpackProductsCallToAction() as Record<
		string,
		TranslateResult
	>;

	return jetpackProductsCallToActions?.[ ( product as Product ).product_slug ];
}
