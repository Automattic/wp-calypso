/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isVipPlan( product ) {
	product = snakeCase( product );

	return 'vip' === product.product_slug;
}
