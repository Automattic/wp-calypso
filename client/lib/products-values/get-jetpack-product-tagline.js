/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';
import { getJetpackProductsTaglines } from 'lib/products-values/translations';

/**
 * Get Jetpack product tagline based on the product purchase object.
 *
 * @param   product {object}             Product purchase object
 * @returns         {string|object} Product tagline
 */
export function getJetpackProductTagline( product ) {
	product = formatProduct( product );
	assertValidProduct( product );
	const jetpackProductsTaglines = getJetpackProductsTaglines();

	return jetpackProductsTaglines?.[ product.product_slug ];
}
