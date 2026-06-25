import type { ShoppingCartItem } from '../types';

export type CheckoutCartProduct = {
	product_id: number;
	product_slug: string;
	extra: {
		isA4ASitelessCheckout: true;
		agency_id: number;
		cart_item_index: number;
		a4a_pressable_site_domain?: string;
	};
};

/**
 * Expand A4A cart items into the flat list of products the WordPress.com
 * checkout expects. Each cart item is added as separate lines (rather than via
 * a single `volume`) so each site gets the correct tier pricing, and so that
 * multiple copies of the same product are issued as distinct licenses.
 *
 * `cart_item_index` is unique across the whole list — including across
 * duplicate cart items — so identical lines are not merged back together.
 *
 * The index is 1-based: a `0` index can be read as "unset" by `empty()`-style
 * checks on the server, which would let an identical line be deduped away.
 */
export function buildCheckoutCartProducts(
	cartItems: ShoppingCartItem[],
	agencyId: number
): CheckoutCartProduct[] {
	let cartItemIndex = 1;

	return cartItems.flatMap( ( product ) => {
		const lineCount = product.quantity > 0 ? product.quantity : 1;

		return Array.from( { length: lineCount }, () => ( {
			// When using the wpcom checkout we use alternative a4a-specific billing product ids for wpcom and jetpack products.
			product_id: product.alternative_product_id || product.product_id,
			product_slug: product.slug,
			extra: {
				isA4ASitelessCheckout: true as const,
				agency_id: agencyId,
				cart_item_index: cartItemIndex++,
				...( product.site_domain ? { a4a_pressable_site_domain: product.site_domain } : {} ),
			},
		} ) );
	} );
}
