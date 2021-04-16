/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { getJetpackProductsShortNames } from './translations';

/**
 * Get Jetpack product short name based on the product purchase object.
 *
 * @param   product {object}             Product purchase object
 * @returns         {string|object} Product short name
 */
export function getJetpackProductShortName( product ) {
	product = formatProduct( product );
	assertValidProduct( product );
	const jetpackProductShortNames = getJetpackProductsShortNames();

	return jetpackProductShortNames?.[ product.product_slug ];
}
