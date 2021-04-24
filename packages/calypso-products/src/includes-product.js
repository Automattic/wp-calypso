/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function includesProduct( products, product ) {
	product = snakeCase( product );
	return products.indexOf( product.product_slug ) >= 0;
}
