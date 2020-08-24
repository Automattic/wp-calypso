/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import { calculateMonthlyPriceForPlan } from 'lib/plans';
import { getPlan } from './plan';

import 'state/plans/init';

/**
 * Returns a plan price
 *
 * @param  {object}  state     global state
 * @param  {number}  productId the plan productId
 * @param  {boolean} isMonthly if true, returns monthly price
 * @returns {number}  plan price
 */
export function getPlanRawPrice( state, productId, isMonthly = false ) {
	const plan = getPlan( state, productId );
	if ( get( plan, 'raw_price', -1 ) < 0 ) {
		return null;
	}

	return isMonthly
		? calculateMonthlyPriceForPlan( plan.product_slug, plan.raw_price )
		: plan.raw_price;
}
