/**
 * Internal dependencies
 */
import { action as ActionTypes } from '../constants';
import cartValues from 'lib/cart-values';
import { cartItems } from 'lib/cart-values';
import Dispatcher from 'dispatcher';
import productsListFactory from 'lib/products-list';
import storeTransactions from 'lib/store-transactions';
import wpcom from 'lib/wp';

const productsList = productsListFactory();

function setDomainDetails( domainDetails ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.TRANSACTION_DOMAIN_DETAILS_SET,
		domainDetails
	} );
}

function setPayment( payment ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.TRANSACTION_PAYMENT_SET,
		payment
	} );
}

function setNewCreditCardDetails( options ) {
	const { rawDetails, maskedDetails } = options;

	Dispatcher.handleViewAction( {
		type: ActionTypes.TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET,
		rawDetails,
		maskedDetails
	} );
}

function submitFreeTransaction( site, cartItem, onComplete ) {
	const addFunction = cartItems.add( cartItem );

	let cart = cartValues.emptyCart( site.ID );

	cart = cartValues.fillInAllCartItemAttributes( addFunction( cart ), productsList.get() );

	wpcom.undocumented().transactions( 'POST', {
		cart,
		payment: {
			paymentMethod: 'WPCOM_Billing_WPCOM'
		}
	}, onComplete );
}

function submitTransaction( { cart, transaction } ) {
	const steps = storeTransactions.submit( {
		cart: cart,
		payment: transaction.payment,
		domainDetails: transaction.domainDetails
	} );

	steps.on( 'data', ( step ) => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.TRANSACTION_STEP_SET,
			step
		} );
	} );
}

function resetTransaction() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.TRANSACTION_RESET
	} );
}

export {
	resetTransaction,
	setDomainDetails,
	setNewCreditCardDetails,
	setPayment,
	submitFreeTransaction,
	submitTransaction
};
