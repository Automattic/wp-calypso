/**
 * Internal dependencies
 */
import { PLAN_HOST_BUNDLE } from './plans-constants';
import { snakeCase } from './snake-case';

export function isJpphpBundle( product ) {
	product = snakeCase( product );

	return product.product_slug === PLAN_HOST_BUNDLE;
}
