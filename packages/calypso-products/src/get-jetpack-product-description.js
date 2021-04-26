/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { getJetpackProductsDescriptions } from './translations';

/**
 * Get Jetpack product description based on the product purchase object.
 *
 * @param   product {object}             Product purchase object
 * @returns         {string|object} Product display name
 */
export function getJetpackProductDescription( product ) {
	product = formatProduct( product );
	assertValidProduct( product );
	const jetpackProductsDescriptions = getJetpackProductsDescriptions();

	return jetpackProductsDescriptions?.[ product.product_slug ];
}
