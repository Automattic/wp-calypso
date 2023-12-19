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
		 * If true, attempt to calculate and return the monthly price.
		 */
		returnMonthly?: boolean;
		/**
		 * If true, represent price as a currency's smallest unit ( as integers
		 * instead of floats ). If precision matters, set to true, as otherwise the
		 * price relies on float division and could have rounding errors.
		 */
		returnSmallestUnit?: boolean;
	} = {}
) {
	const plan = getSitePlan( state, siteId, productSlug );
	const rawPrice = plan?.rawPrice ?? -1;

	if ( rawPrice < 0 || ! isSitePlanDiscounted( state, siteId, productSlug ) || ! plan ) {
		return null;
	}

	const discountPrice = returnSmallestUnit ? plan.rawPriceInteger : rawPrice;
	return returnMonthly ? calculateMonthlyPriceForPlan( productSlug, discountPrice ) : discountPrice;
}
