import { calculateMonthlyPriceForPlan } from '@automattic/calypso-products';
import { getSitePlan } from 'calypso/state/sites/plans/selectors/get-site-plan';
import { isSitePlanDiscounted } from 'calypso/state/sites/plans/selectors/is-site-plan-discounted';
import type { IAppState } from 'calypso/state/types';

/**
 * Returns a plan price, including any applied discounts
 */
export function getPlanDiscountedRawPrice(
	state: IAppState,
	siteId: number | undefined,
	productSlug: string,
	{
		isMonthly = false,
	}: {
		/**
		 * If true, attempt to calculate and return the monthly price. Note that this
		 * is not precise as it relies on float division and could have rounding
		 * errors.
		 */
		isMonthly?: boolean;
	} = {}
) {
	const plan = getSitePlan( state, siteId, productSlug );

	if ( ( plan?.rawPrice ?? -1 ) < 0 || ! isSitePlanDiscounted( state, siteId, productSlug ) ) {
		return null;
	}
	if ( ! plan ) {
		return null;
	}
	const discountPrice = plan.rawPrice;
	return isMonthly ? calculateMonthlyPriceForPlan( productSlug, discountPrice ) : discountPrice;
}
