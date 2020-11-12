/**
 * External dependencies
 */
import type { ResponseCart } from '@automattic/shopping-cart';

export default function doesPurchaseHaveFullCredits( cart: ResponseCart ): boolean {
	const isPurchaseFree = cart.total_cost_integer === 0;
	const credits = cart.credits_integer;
	return ! isPurchaseFree && credits > 0 && credits >= cart.sub_total_integer;
}
