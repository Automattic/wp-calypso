/**
 * Internal dependencies
 */
import { JETPACK_SEARCH_PRODUCTS } from './jetpack-constants';
import { snakeCase } from './snake-case';

export function isJetpackSearch( product ) {
	product = snakeCase( product );

	return JETPACK_SEARCH_PRODUCTS.includes( product.product_slug );
}
