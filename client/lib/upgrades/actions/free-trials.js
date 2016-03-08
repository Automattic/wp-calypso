/**
 * Internal dependencies
 */
import { cartItems, emptyCart, fillInAllCartItemAttributes } from 'lib/cart-values';
import productsListFactory from 'lib/products-list';
import { fullCreditsPayment } from 'lib/store-transactions';
import { submitTransaction } from './checkout';

const productsList = productsListFactory();

function submitFreeTransaction( partialCart, onComplete ) {
	const cart = fillInAllCartItemAttributes( partialCart, productsList.get() ),
		transaction = {
			payment: fullCreditsPayment()
		};

	submitTransaction( { cart, transaction }, onComplete );
}

export function startFreeTrial( siteId, plan, onComplete ) {
	let cart = emptyCart( siteId, { temporary: true } );
	const planItem = cartItems.getItemForPlan( plan, { isFreeTrial: true } );

	cart = cartItems.add( planItem )( cart );

	submitFreeTransaction( cart, onComplete );
}
