/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { getJetpackProductsDisplayNames } from './translations';

/**
 * Get Jetpack product display name based on the product purchase object.
 *
 * @param   product {object}             Product purchase object
 * @returns         {string|object} Product display name
 */
export function getJetpackProductDisplayName( product ) {
	product = snakeCase( product );
	const jetpackProductsDisplayNames = getJetpackProductsDisplayNames();

	return jetpackProductsDisplayNames?.[ product.product_slug ];
}
