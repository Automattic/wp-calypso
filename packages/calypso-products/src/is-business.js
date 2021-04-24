/**
 * Internal dependencies
 */
import { isBusinessPlan } from './main';
import { snakeCase } from './snake-case';

export function isBusiness( product ) {
	product = snakeCase( product );
	return isBusinessPlan( product.product_slug );
}
