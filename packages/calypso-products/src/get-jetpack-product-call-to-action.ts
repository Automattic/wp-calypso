/**
 * External dependencies
 */
import { TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { getJetpackProductsCallToAction } from './translations';

/**
 * Type dependencies
 */
import type { Product } from './products-list';

/**
 * Get Jetpack product call-to-action based on the product purchase object.
 *
 * @param {object} product Product purchase object
 * @returns {TranslateResult} Product display name
 */
export function getJetpackProductCallToAction( product: unknown ): TranslateResult | undefined {
	product = snakeCase( product );
	const jetpackProductsCallToActions = getJetpackProductsCallToAction() as Record<
		string,
		TranslateResult
	>;

	return jetpackProductsCallToActions?.[ ( product as Product ).product_slug ];
}
