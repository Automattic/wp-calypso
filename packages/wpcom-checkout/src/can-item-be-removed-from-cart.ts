import { isDIFMProduct, isPlan } from '@automattic/calypso-products';
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Determine whether there is a DIFM (Do it for me) product in the shopping cart.
 */
function hasDIFMProduct( cart: ResponseCart ): boolean {
	return cart.products.some( isDIFMProduct );
}

/**
 * Check if the given item is a plan product and the DIFM product exists in the provided shopping cart object
 */
function isPlanWithDIFMInTheCart( item: ResponseCartProduct, responseCart: ResponseCart ) {
	return isPlan( item ) && hasDIFMProduct( responseCart );
}

/**
 * Check if a cart item can be removed from the cart.
 *
 * If this returns false, there will be no option to remove the specified
 * product from the cart.
 *
 * Please use this sparingly; it's often better to add guards inside the
 * shopping-cart endpoint on the backend rather than here. Not being shown any
 * way to remove an item from the cart can be very confusing for users. If you
 * add a guard in the shopping-cart endpoint instead, it can return an error
 * message to explain why.
 */
export function canItemBeRemovedFromCart(
	item: ResponseCartProduct,
	responseCart: ResponseCart
): boolean {
	const itemTypesThatCannotBeDeleted = [ 'domain_redemption' ];
	if ( itemTypesThatCannotBeDeleted.includes( item.product_slug ) ) {
		return false;
	}

	// The plan cannot be removed from the cart when in combination with the DIFM lite product
	if ( isPlanWithDIFMInTheCart( item, responseCart ) ) {
		return false;
	}

	// If the item is an A4A siteless checkout, it cannot be removed from the cart
	if ( item.extra?.isA4ASitelessCheckout ) {
		return false;
	}

	return true;
}
