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
	const origCost = plan?.orig_cost ?? 0;
	const origCostInteger = plan?.orig_cost_integer ?? 0;

	if ( rawPrice < 0 ) {
		return null;
	}

	let price = origCost || rawPrice;

	if ( returnSmallestUnit ) {
		// origCost returned by the Stores API has a quirk. orig_cost will be undefined if the cost of a store
		// product has been not overridden by a promotion or a coupon. In the same scenario however, origCostInteger
		// will return a meaningful value, and it will fall back to the price of rawPriceInteger instead. Because
		// origCostInteger will never be undefined, and because it already defaults to rawPriceInteger, we can simply
		// return origCostInteger here.

		// TODO clk: when migrating to data-stores this would be the equivalent
		// of `pricing.originalPrice[ 'full' | 'monthly' ]` (without `siteId`)
		price = origCostInteger;
	}

	return returnMonthly
		? calculateMonthlyPriceForPlan( plan?.product_slug ?? '', price ?? 0 )
		: price ?? null;
}
