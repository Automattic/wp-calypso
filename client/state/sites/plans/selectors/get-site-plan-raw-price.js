/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { calculateMonthlyPriceForPlan } from 'calypso/lib/plans';
import { getSitePlan } from 'calypso/state/sites/plans/selectors/get-site-plan';

/**
 * Returns a plan price before discount
 *
 * @param  {object}  state         global state
 * @param  {number}  siteId        the site id
 * @param  {string}  productSlug   the plan product slug
 * @param  {boolean} isMonthly     if true, returns monthly price
 * @returns {number}                plan raw price
 */
export function getSitePlanRawPrice( state, siteId, productSlug, { isMonthly = false } = {} ) {
	const plan = getSitePlan( state, siteId, productSlug );

	if ( get( plan, 'rawPrice', -1 ) < 0 ) {
		return null;
	}

	const price = plan.rawPrice + get( plan, 'rawDiscount', 0 );

	return isMonthly ? calculateMonthlyPriceForPlan( productSlug, price ) : price;
}
