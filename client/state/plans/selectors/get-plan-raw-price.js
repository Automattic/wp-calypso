/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import { calculateMonthlyPriceForPlan } from 'calypso/lib/plans';
import { getPlan } from './plan';

import 'calypso/state/plans/init';

/**
 * Returns the full plan price if a discount is available and the raw price if a discount is not available
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
	const price = get( plan, 'orig_cost', 0 ) || plan.raw_price;

	return isMonthly ? calculateMonthlyPriceForPlan( plan.product_slug, price ) : price;
}
