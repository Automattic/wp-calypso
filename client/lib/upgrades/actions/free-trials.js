/** @format */
/**
 * Internal dependencies
 */
import { emptyCart, fillInAllCartItemAttributes } from 'lib/cart-values';
import { getItemForPlan, add as addCartItem } from 'lib/cart-values/cart-items';
import productsListFactory from 'lib/products-list';
import { fullCreditsPayment } from 'lib/store-transactions';
import { submitTransaction } from './checkout';

const productsList = productsListFactory();

/*
 * Submit a free cart transaction
 *
 * This an helper method to be used for when we want to make a
 * quick (free) transaction without a valid payment method.
 * The default payment method for free carts is used here.
 *
 * {cart} [partialCart] - A cart-like object. We just need a valid `product_slug` property for cart items
 * {function} [onComplete] Callback function called on completion
 */
function submitFreeTransaction( partialCart, onComplete ) {
	const cart = fillInAllCartItemAttributes( partialCart, productsList.get() ),
		transaction = {
			payment: fullCreditsPayment,
		};

	submitTransaction( { cart, transaction }, onComplete );
}

/*
 * Start a free trial for a given site and plan
 *
 * This method creates a free cart containing our plan as a cart item with the
 * `isFreeTrial` option set to `true`. It uses `submitFreeTransaction` to make the request.
 *
 * {int} [siteId] - The ID of the site this free trial is for.
 * {Object} [plan] - A plan-like object. We just need a valid `product_slug` property to make a cartItem out of it.
 * {function} [onComplete] Callback function called on completion
 */
export function startFreeTrial( siteId, plan, onComplete ) {
	let cart = emptyCart( siteId, { temporary: true } );
	const planItem = getItemForPlan( plan, { isFreeTrial: true } );

	cart = addCartItem( planItem )( cart );

	submitFreeTransaction( cart, onComplete );
}
