import { calculateMonthlyPriceForPlan } from '@automattic/calypso-products';
import { getPlan } from './plan';

import 'calypso/state/plans/init';

/**
 * Returns a plan price
 *
 * @param  {Object}  state     global state
 * @param  {number}  productId the plan productId
 * @param  {boolean} isMonthly if true, returns monthly price
 * @returns {number|null}  plan price
 */
export function getDiscountedRawPrice( state, productId, isMonthly = false ) {
	const plan = getPlan( state, productId );
	const rawPrice = plan?.raw_price ?? -1;
	const origCost = plan?.orig_cost ?? -1;
	if ( rawPrice < 0 || origCost < 0 ) {
		return null;
	}

	return isMonthly
		? calculateMonthlyPriceForPlan( plan.product_slug, plan.raw_price )
		: plan.raw_price;
}
