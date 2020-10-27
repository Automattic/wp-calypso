/**
 * External dependencies
 */

import { assign, cloneDeep, get, merge } from 'lodash';
import update from 'immutability-helper';

/**
 * Internal dependencies
 */
import { CART_ITEM_REMOVE } from 'calypso/lib/cart/action-types';
import {
	TRANSACTION_DOMAIN_DETAILS_SET,
	TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET,
	TRANSACTION_PAYMENT_SET,
	TRANSACTION_RESET,
	TRANSACTION_STEP_SET,
	TRANSACTION_STRIPE_SET,
} from './action-types';
import { hasDomainDetails } from './selectors';
import { hasDomainRegistration } from 'calypso/lib/cart-values/cart-items';
import CartStore from 'calypso/lib/cart/store';
import Emitter from 'calypso/lib/mixins/emitter';
import Dispatcher from 'calypso/dispatcher';
import { BEFORE_SUBMIT } from 'calypso/lib/store-transactions/step-types';

let _transaction = createInitialTransaction();

const TransactionStore = {
	get: function () {
		return _transaction;
	},
};

Emitter( TransactionStore );

function replaceData( newData ) {
	_transaction = cloneDeep( newData );
	TransactionStore.emit( 'change' );
}

function createInitialTransaction() {
	return {
		errors: {},
		newCardFormFields: {},
		newCardRawDetails: {},
		step: { name: BEFORE_SUBMIT },
		domainDetails: null,
	};
}

function reset() {
	replaceData( createInitialTransaction() );
}

function setDomainDetails( domainDetails ) {
	replaceData( merge( _transaction, { domainDetails: domainDetails } ) );
}

function setPayment( payment ) {
	replaceData( assign( {}, _transaction, { payment: payment } ) );
}

function setStripeObject( stripe, stripeConfiguration ) {
	replaceData( assign( {}, _transaction, { stripe, stripeConfiguration } ) );
}

function setStep( step ) {
	replaceData(
		assign( {}, _transaction, {
			step: step,
			errors: step.error ? step.error.message : {},
		} )
	);
}

function setNewCreditCardDetails( options ) {
	// Store the card details on the transaction object. These can be used to
	// repopulate the new credit card form and payment object with the correct
	// default values if the credit card form ever needs to be built again.
	const transactionUpdates = {
		newCardFormFields: { $merge: options.maskedDetails },
		newCardRawDetails: { $merge: options.rawDetails },
	};

	// If the new card is the active payment method, populate the payment
	// object now. (If it isn't, any code which later switches to this payment
	// method is responsible for using the above data to populate the payment
	// object correctly, e.g. by calling newCardPayment() and passing in the
	// transaction.newCardRawDetails object from above.)
	if ( get( _transaction, [ 'payment', 'newCardDetails' ] ) ) {
		transactionUpdates.payment = { newCardDetails: { $merge: options.rawDetails } };
	}

	const newTransaction = update( _transaction, transactionUpdates );

	replaceData( newTransaction );
}

TransactionStore.dispatchToken = Dispatcher.register( function ( payload ) {
	const action = payload.action;

	switch ( action.type ) {
		case TRANSACTION_DOMAIN_DETAILS_SET:
			setDomainDetails( action.domainDetails );
			break;

		case TRANSACTION_PAYMENT_SET:
			setPayment( action.payment );
			break;

		case TRANSACTION_STRIPE_SET:
			setStripeObject( action.stripe, action.stripeConfiguration );
			break;

		case TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET:
			setNewCreditCardDetails( {
				rawDetails: action.rawDetails,
				maskedDetails: action.maskedDetails,
			} );
			break;

		case TRANSACTION_STEP_SET:
			setStep( action.step );
			break;

		case TRANSACTION_RESET:
			reset();
			break;

		case CART_ITEM_REMOVE:
			Dispatcher.waitFor( [ CartStore.dispatchToken ] );

			if (
				! hasDomainRegistration( CartStore.get() ) &&
				hasDomainDetails( TransactionStore.get() )
			) {
				setDomainDetails( null );
			}
			break;
	}
} );

export default TransactionStore;
