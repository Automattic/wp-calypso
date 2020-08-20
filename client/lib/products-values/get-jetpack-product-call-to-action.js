/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';
import { getJetpackProductsCallToAction } from 'lib/products-values/translations';

/**
 * Get Jetpack product call-to-action based on the product purchase object.
 *
 * @param product {object} Product purchase object
 * @returns {string|object} Product display name
 */
export function getJetpackProductCallToAction( product ) {
	product = formatProduct( product );
	assertValidProduct( product );
	const jetpackProductsCallToActions = getJetpackProductsCallToAction();

	return jetpackProductsCallToActions?.[ product.product_slug ];
}
