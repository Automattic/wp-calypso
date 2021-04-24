/**
 * Internal dependencies
 */
import { PLAN_BIENNIAL_PERIOD } from './plans-constants';

export function isBiennially( product ) {
	return parseInt( product.bill_period, 10 ) === PLAN_BIENNIAL_PERIOD;
}
