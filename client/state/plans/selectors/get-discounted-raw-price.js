/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { calculateMonthlyPriceForPlan } from 'calypso/lib/plans';
import { getPlan } from './plan';

import 'calypso/state/plans/init';

/**
 * Returns a plan price
 *
 * @param  {object}  state     global state
 * @param  {number}  productId the plan productId
 * @param  {boolean} isMonthly if true, returns monthly price
 * @returns {number}  plan price
 */
export function getDiscountedRawPrice( state, productId, isMonthly = false ) {
	const plan = getPlan( state, productId );
	if ( get( plan, 'raw_price', -1 ) < 0 || get( plan, 'orig_cost', -1 ) < 0 ) {
		return null;
	}

	return isMonthly
		? calculateMonthlyPriceForPlan( plan.product_slug, plan.raw_price )
		: plan.raw_price;
}
