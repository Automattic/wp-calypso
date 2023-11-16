import { calculateMonthlyPriceForPlan } from '@automattic/calypso-products';
import { getSitePlan } from 'calypso/state/sites/plans/selectors/get-site-plan';
import type { IAppState } from 'calypso/state/types';

/**
 * Returns a plan price before discount
 */
export function getSitePlanRawPrice(
	state: IAppState,
	siteId: number,
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

	if ( ! plan || rawPrice < 0 ) {
		return null;
	}

	const price = returnSmallestUnit
		? plan.rawPriceInteger + plan.rawDiscountInteger
		: rawPrice + parseFloat( plan.rawDiscount );

	return returnMonthly ? calculateMonthlyPriceForPlan( productSlug, price ) : price;
}
