import { calculateMonthlyPriceForPlan } from '@automattic/calypso-products';
import { getPlan } from './plan';
import type { IAppState } from 'calypso/state/types';

import 'calypso/state/plans/init';

export function getDiscountedRawPrice(
	state: IAppState,
	productId: number,

	/**
	 * If true, attempt to calculate and return the monthly price.
	 */
	returnMonthly = false,
	/**
	 * If true, represent price as a currency's smallest unit ( as integers
	 * instead of floats ). If precision matters, set to true, as otherwise the
	 * price relies on float division and could have rounding errors.
	 */
	returnSmallestUnit = false
): number | null {
	const plan = getPlan( state, productId );
	const rawPrice = plan?.raw_price ?? -1;
	const origCost = plan?.orig_cost ?? -1;

	if ( rawPrice < 0 || origCost < 0 || ! plan ) {
		return null;
	}

	const price = returnSmallestUnit ? plan.raw_price_integer : rawPrice;
	return returnMonthly ? calculateMonthlyPriceForPlan( plan.product_slug, price ) : price;
}
