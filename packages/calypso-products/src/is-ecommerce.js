/**
 * Internal dependencies
 */
import { isEcommercePlan } from './main';
import { snakeCase } from './snake-case';

export function isEcommerce( product ) {
	product = snakeCase( product );

	return isEcommercePlan( product.product_slug );
}
