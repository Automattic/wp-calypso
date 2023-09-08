import { calculateMonthlyPriceForPlan } from '@automattic/calypso-products';
import { getPlan } from './plan';
import type { AppState } from 'calypso/types';

import 'calypso/state/plans/init';

/**
 * Returns the full plan price if a discount is available and the raw price if a discount is not available
 */
export function getPlanRawPrice(
	state: AppState,
	productId: number,
	returnMonthly?: boolean,
	returnSmallestUnit?: boolean
): number | null {
	const plan = getPlan( state, productId );
	const rawPrice = plan?.raw_price ?? -1;
	const rawPriceInteger = plan?.raw_price_integer ?? 0;
	const origCost = plan?.orig_cost ?? 0;
	const origCostInteger = plan?.orig_cost_integer ?? 0;

	if ( rawPrice < 0 ) {
		return null;
	}

	let price = origCost || rawPrice;

	if ( returnSmallestUnit ) {
		// We check origCost here because of a quirk with the Stores API. orig_cost will be undefined if
		// the cost of a store product is overridden by a promotion or a coupon. In the same scenario
		// however, origCostInteger will not return a falsey value. The price will return a value identical
		// to rawPriceInteger instead.
		price = origCost ? origCostInteger : rawPriceInteger;
	}

	return returnMonthly
		? calculateMonthlyPriceForPlan( plan?.product_slug ?? '', price ?? 0 )
		: price ?? null;
}
