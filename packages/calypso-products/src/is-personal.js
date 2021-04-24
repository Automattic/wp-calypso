/**
 * Internal dependencies
 */
import { isPersonalPlan } from './main';
import { snakeCase } from './snake-case';

export function isPersonal( product ) {
	product = snakeCase( product );
	return isPersonalPlan( product.product_slug );
}
