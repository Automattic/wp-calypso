/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { calculateMonthlyPriceForPlan } from 'calypso/lib/plans';

import { getSitePlan } from 'calypso/state/sites/plans/selectors/get-site-plan';
import { isSitePlanDiscounted } from 'calypso/state/sites/plans/selectors/is-site-plan-discounted';

/**
 * Returns a plan price, including any applied discounts
 *
 * @param  {object}  state         global state
 * @param  {number}  siteId        the site id
 * @param  {string}  productSlug   the plan product slug
 * @param  {boolean} isMonthly     if true, returns monthly price
 * @returns {number}                plan discounted raw price
 */
export function getPlanDiscountedRawPrice(
	state,
	siteId,
	productSlug,
	{ isMonthly = false } = {}
) {
	const plan = getSitePlan( state, siteId, productSlug );

	if ( get( plan, 'rawPrice', -1 ) < 0 || ! isSitePlanDiscounted( state, siteId, productSlug ) ) {
		return null;
	}
	const discountPrice = plan.rawPrice;
	return isMonthly ? calculateMonthlyPriceForPlan( productSlug, discountPrice ) : discountPrice;
}
