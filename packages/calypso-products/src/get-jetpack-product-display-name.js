/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { getJetpackProductsDisplayNames } from './translations';

/**
 * Get Jetpack product display name based on the product purchase object.
 *
 * @param   product {object}             Product purchase object
 * @returns         {string|object} Product display name
 */
export function getJetpackProductDisplayName( product ) {
	product = formatProduct( product );
	const jetpackProductsDisplayNames = getJetpackProductsDisplayNames();

	return jetpackProductsDisplayNames?.[ product.product_slug ];
}
