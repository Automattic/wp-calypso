/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { getJetpackProductsDescriptions } from './translations';

/**
 * Get Jetpack product description based on the product purchase object.
 *
 * @param   product {object}             Product purchase object
 * @returns         {string|object} Product display name
 */
export function getJetpackProductDescription( product ) {
	product = snakeCase( product );
	const jetpackProductsDescriptions = getJetpackProductsDescriptions();

	return jetpackProductsDescriptions?.[ product.product_slug ];
}
