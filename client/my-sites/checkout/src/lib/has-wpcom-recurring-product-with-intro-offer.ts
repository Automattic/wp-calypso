import { isWpComPlan } from '@automattic/calypso-products';
import { getCartItemBillPeriod } from 'calypso/lib/cart-values/cart-items';
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';

function hasIntroductoryOffer( product: ResponseCartProduct ): boolean {
	return Boolean(
		product.introductory_offer_terms?.enabled && ! product.introductory_offer_terms?.reason
	);
}

function isWpcomProduct( product: ResponseCartProduct ): boolean {
	return isWpComPlan( product.product_slug );
}

function isYearlyOrLongerBilling( product: ResponseCartProduct ): boolean {
	const billPeriod = getCartItemBillPeriod( product );
	return billPeriod >= 12; // 12 months or more
}

/**
 * Check if a product is a WPCOM recurring product (yearly or more) with an introductory offer
 */
export function isWpcomRecurringProductWithIntroOffer( product: ResponseCartProduct ): boolean {
	return (
		! product.is_one_time_purchase &&
		isWpcomProduct( product ) &&
		isYearlyOrLongerBilling( product ) &&
		hasIntroductoryOffer( product )
	);
}

/**
 * Check if the cart contains a WPCOM recurring product (yearly or more) with an introductory offer
 */
export function hasWpcomRecurringProductWithIntroOffer( cart: ResponseCart ): boolean {
	return cart.products.some( ( product ) => isWpcomRecurringProductWithIntroOffer( product ) );
}
