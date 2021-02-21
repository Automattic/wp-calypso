/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { getJetpackProductsShortNames } from 'calypso/lib/products-values/translations';

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
