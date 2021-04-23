/**
 * Internal dependencies
 */
import { PLAN_MONTHLY_PERIOD } from './index';
import { WPCOM_MONTHLY_PLANS } from './constants';
import { JETPACK_MONTHLY_PLANS } from './jetpack-constants';
import { formatProduct } from './format-product';

export function isMonthlyProduct( rawProduct ) {
	const product = formatProduct( rawProduct );

	return parseInt( product.bill_period, 10 ) === PLAN_MONTHLY_PERIOD;
}

export function isMonthly( plan ) {
	return WPCOM_MONTHLY_PLANS.includes( plan ) || JETPACK_MONTHLY_PLANS.includes( plan );
}
