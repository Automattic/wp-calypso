/**
 * Internal dependencies
 */
import { PLAN_BIENNIAL_PERIOD } from './plans-constants';
import { snakeCase } from './snake-case';

export function isBiennially( rawProduct ) {
	const product = snakeCase( rawProduct );

	return parseInt( product.bill_period, 10 ) === PLAN_BIENNIAL_PERIOD;
}
