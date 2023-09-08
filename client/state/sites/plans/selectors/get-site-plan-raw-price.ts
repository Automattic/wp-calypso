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
		 * If true, attempt to calculate and return the monthly price. Note that this
		 * is not precise as it relies on float division and could have rounding
		 * errors.
		 */
		returnMonthly?: boolean;
		returnSmallestUnit?: boolean;
	} = {}
) {
	const plan = getSitePlan( state, siteId, productSlug );
	if ( ! plan ) {
		return null;
	}

	if ( ( plan.rawPrice ?? -1 ) < 0 ) {
		return null;
	}

	let price = 0;

	if ( returnSmallestUnit ) {
		price = plan.rawPriceInteger + plan.rawDiscountInteger;
	} else {
		price = plan.rawPrice + parseFloat( plan.rawDiscount );
	}

	return returnMonthly ? calculateMonthlyPriceForPlan( productSlug, price ) : price;
}
