/**
 * Internal dependencies
 */
import { PLAN_ANNUAL_PERIOD } from './plans-constants';

export function isYearly( product ) {
	return parseInt( product.bill_period, 10 ) === PLAN_ANNUAL_PERIOD;
}
