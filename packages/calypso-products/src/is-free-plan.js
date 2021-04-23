/**
 * Internal dependencies
 */
import { PLAN_FREE } from './plans-constants';
import { snakeCase } from './snake-case';

export function isFreePlanProduct( product ) {
	product = snakeCase( product );

	return product.product_slug === PLAN_FREE;
}
