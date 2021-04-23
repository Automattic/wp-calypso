/**
 * Internal dependencies
 */
import { PLAN_ANNUAL_PERIOD } from './plans-constants';
import { snakeCase } from './snake-case';

export function isYearly( rawProduct ) {
	const product = snakeCase( rawProduct );

	return parseInt( product.bill_period, 10 ) === PLAN_ANNUAL_PERIOD;
}
