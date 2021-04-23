/**
 * Internal dependencies
 */
import { PLAN_CHARGEBACK } from './plans-constants';
import { snakeCase } from './snake-case';

export function isChargeback( product ) {
	product = snakeCase( product );

	return product.product_slug === PLAN_CHARGEBACK;
}
