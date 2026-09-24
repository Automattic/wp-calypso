import type { ResponseCart } from '@automattic/shopping-cart';
import type { PreparedCheckoutProduct } from 'calypso/a8c-for-agencies/data/marketplace/use-prepare-checkout';

export type PreparedCartProblem = 'empty' | 'mismatch';

/**
 * Check that the server cart the checkout just loaded is the one a
 * prepared-checkout endpoint said it saved.
 *
 * With `expected` (right after preparing) the cart must contain exactly those
 * products at those quantities. Without it (a reload of `skip_active_cart=1`)
 * any non-empty cart is accepted. Never fall back to Marketplace selections.
 */
export function validatePreparedCart(
	cart: Pick< ResponseCart, 'products' >,
	expected?: PreparedCheckoutProduct[]
): PreparedCartProblem | null {
	if ( ! cart.products.length ) {
		return 'empty';
	}
	if ( ! expected?.length ) {
		return null;
	}
	if ( cart.products.length !== expected.length ) {
		return 'mismatch';
	}
	for ( const item of expected ) {
		const match = cart.products.find(
			( product ) =>
				product.product_id === item.product_id && ( product.quantity ?? 1 ) === item.quantity
		);
		if ( ! match ) {
			return 'mismatch';
		}
	}
	return null;
}
