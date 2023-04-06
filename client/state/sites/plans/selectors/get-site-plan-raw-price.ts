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

	if ( ( plan.rawPrice ?? -1 ) < 0 ) {
		return null;
	}

	const price = plan.rawPrice + parseFloat( plan.rawDiscount );

	return returnMonthly ? calculateMonthlyPriceForPlan( productSlug, price ) : price;
}
