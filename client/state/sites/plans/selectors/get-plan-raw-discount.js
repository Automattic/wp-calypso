/**
 * Internal dependencies
 */
import { calculateMonthlyPriceForPlan } from 'calypso/lib/plans';
import { getSitePlan } from 'calypso/state/sites/plans/selectors/get-site-plan';
import { isSitePlanDiscounted } from 'calypso/state/sites/plans/selectors/is-site-plan-discounted';

/**
 * Returns a plan raw discount. It's the value which was subtracted from the plan's original raw price.
 * Use getPlanDiscountedRawPrice if you need a plan's raw price after applying the discount.
 *
 * @param  {object}  state        global state
 * @param  {number}  siteId       the site id
 * @param  {string}  productSlug  the plan product slug
 * @param  {boolean} isMonthly    if true, returns monthly price
 * @returns {number}               plan raw discount
 */
export function getPlanRawDiscount( state, siteId, productSlug, { isMonthly = false } = {} ) {
	const plan = getSitePlan( state, siteId, productSlug );

	if ( ! isSitePlanDiscounted( state, siteId, productSlug ) ) {
		return null;
	}

	return isMonthly
		? calculateMonthlyPriceForPlan( productSlug, plan.rawDiscount )
		: plan.rawDiscount;
}
