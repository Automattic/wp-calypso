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
		returnMonthly,
		returnSmallestUnit,
	}: {
		/**
		 * If true, attempt to calculate and return the monthly price. Note that if
		 * precision matters, set returnSmallesUnit to true for the currency as otherwise,
		 * the price relies on float division and could have rounding errors.
		 */
		returnMonthly?: boolean;
		returnSmallestUnit?: boolean;
	} = {}
) {
	const plan = getSitePlan( state, siteId, productSlug );

	if ( ( plan?.rawPrice ?? -1 ) < 0 || ! isSitePlanDiscounted( state, siteId, productSlug ) ) {
		return null;
	}
	if ( ! plan ) {
		return null;
	}
	const discountPrice = returnSmallestUnit ? plan.rawPriceInteger : plan.rawPrice;
	return returnMonthly ? calculateMonthlyPriceForPlan( productSlug, discountPrice ) : discountPrice;
}
