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
	returnMonthly?: boolean
): number | null {
	const plan = getPlan( state, productId );
	const rawPrice = plan?.raw_price ?? -1;
	const origCost = plan?.orig_cost ?? 0;
	if ( rawPrice < 0 ) {
		return null;
	}
	const price = origCost || plan?.raw_price;

	return returnMonthly
		? calculateMonthlyPriceForPlan( plan?.product_slug ?? '', price ?? 0 )
		: price ?? null;
}
