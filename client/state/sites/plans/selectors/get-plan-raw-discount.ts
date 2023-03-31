import { calculateMonthlyPriceForPlan } from '@automattic/calypso-products';
import { getSitePlan } from 'calypso/state/sites/plans/selectors/get-site-plan';
import { isSitePlanDiscounted } from 'calypso/state/sites/plans/selectors/is-site-plan-discounted';
import type { IAppState } from 'calypso/state/types';

/**
 * Returns a plan raw discount. It's the value which was subtracted from the plan's original raw price.
 * Use getPlanDiscountedRawPrice if you need a plan's raw price after applying the discount.
 */
export function getPlanRawDiscount(
	state: IAppState,
	siteId: number,
	productSlug: string,
	{
		returnMonthly,
	}: {
		/**
		 * If true, attempt to calculate and return the monthly price. Note that this
		 * is not precise as it relies on float division and could have rounding
		 * errors.
		 */
		returnMonthly?: boolean;
	} = {}
) {
	const plan = getSitePlan( state, siteId, productSlug );

	if ( ! plan ) {
		return null;
	}

	if ( ! isSitePlanDiscounted( state, siteId, productSlug ) ) {
		return null;
	}

	return returnMonthly
		? calculateMonthlyPriceForPlan( productSlug, parseFloat( plan.rawDiscount ) )
		: plan.rawDiscount;
}
