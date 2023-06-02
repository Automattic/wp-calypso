import { calculateMonthlyPriceForPlan } from '@automattic/calypso-products';
import { getPlan } from './plan';
import type { IAppState } from 'calypso/state/types';

import 'calypso/state/plans/init';

export function getDiscountedRawPrice(
	state: IAppState,
	productId: number,

	/**
	 * If true, attempt to calculate and return the monthly price. Note that this
	 * is not precise as it relies on float division and could have rounding
	 * errors.
	 */
	returnMonthly = false
): number | null {
	const plan = getPlan( state, productId );
	const rawPrice = plan?.raw_price ?? -1;
	const origCost = plan?.orig_cost ?? -1;

	if ( rawPrice < 0 || origCost < 0 ) {
		return null;
	}
	if ( ! plan ) {
		return null;
	}

	return returnMonthly
		? calculateMonthlyPriceForPlan( plan.product_slug, plan.raw_price )
		: plan.raw_price;
}
