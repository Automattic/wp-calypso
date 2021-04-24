/**
 * Internal dependencies
 */
import { JETPACK_MONTHLY_PLANS, PLAN_MONTHLY_PERIOD, WPCOM_MONTHLY_PLANS } from './plans-constants';

export function isMonthlyProduct( product ) {
	return parseInt( product.bill_period, 10 ) === PLAN_MONTHLY_PERIOD;
}

export function isMonthly( plan ) {
	return WPCOM_MONTHLY_PLANS.includes( plan ) || JETPACK_MONTHLY_PLANS.includes( plan );
}
