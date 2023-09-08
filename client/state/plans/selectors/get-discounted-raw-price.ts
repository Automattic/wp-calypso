import { calculateMonthlyPriceForPlan } from '@automattic/calypso-products';
import { getPlan } from './plan';
import type { IAppState } from 'calypso/state/types';

import 'calypso/state/plans/init';

export function getDiscountedRawPrice(
	state: IAppState,
	productId: number,

	/**
	 * If true, attempt to calculate and return the monthly price. Note that if
	 * precision matters, set returnSmallesUnit to true for the currency as otherwise,
	 * the price relies on float division and could have rounding errors.
	 */
	returnMonthly = false,
	returnSmallestUnit = false
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

	const price = returnSmallestUnit ? plan?.raw_price_integer : plan?.raw_price;

	return returnMonthly ? calculateMonthlyPriceForPlan( plan.product_slug, price ) : price;
}
