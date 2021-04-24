/**
 * Internal dependencies
 */
import { PLAN_JETPACK_FREE } from './plans-constants';
import { snakeCase } from './snake-case';

export function isFreeJetpackPlan( product ) {
	product = snakeCase( product );
	return product.product_slug === PLAN_JETPACK_FREE;
}
