/**
 * Internal dependencies
 */
import { PLAN_WPCOM_ENTERPRISE } from './plans-constants';
import { snakeCase } from './snake-case';

export function isEnterprise( product ) {
	product = snakeCase( product );

	return product.product_slug === PLAN_WPCOM_ENTERPRISE;
}
