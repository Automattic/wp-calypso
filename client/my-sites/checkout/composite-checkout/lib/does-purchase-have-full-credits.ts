/**
 * External dependencies
 */
import type { ResponseCart } from '@automattic/shopping-cart';

export default function doesPurchaseHaveFullCredits( cart: ResponseCart ): boolean {
	const credits = cart.credits_integer;
	const subtotal = cart.sub_total_integer;
	return credits > 0 && subtotal > 0 && credits >= subtotal;
}
