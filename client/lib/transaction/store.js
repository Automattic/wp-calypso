/** @format */

/**
 * External dependencies
 */

import { assign, cloneDeep, merge } from 'lodash';
import update from 'immutability-helper';

/**
 * Internal dependencies
 */
import { action as UpgradesActionTypes } from 'lib/upgrades/action-types';
import { cartItems } from 'lib/cart-values';
import CartStore from 'lib/cart/store';
import Emitter from 'lib/mixins/emitter';
import Dispatcher from 'dispatcher';
import { BEFORE_SUBMIT } from 'lib/store-transactions/step-types';
import { hasDomainDetails } from 'lib/store-transactions';

let _transaction = createInitialTransaction();

const TransactionStore = {
	get: function() {
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
	if ( _transaction.payment.newCardDetails ) {
		transactionUpdates.payment = { newCardDetails: { $merge: options.rawDetails } };
	}

	const newTransaction = update( _transaction, transactionUpdates );

	replaceData( newTransaction );
}

TransactionStore.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload.action;

	switch ( action.type ) {
		case UpgradesActionTypes.TRANSACTION_DOMAIN_DETAILS_SET:
			setDomainDetails( action.domainDetails );
			break;

		case UpgradesActionTypes.TRANSACTION_PAYMENT_SET:
			setPayment( action.payment );
			break;

		case UpgradesActionTypes.TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET:
			setNewCreditCardDetails( {
				rawDetails: action.rawDetails,
				maskedDetails: action.maskedDetails,
			} );
			break;

		case UpgradesActionTypes.TRANSACTION_STEP_SET:
			setStep( action.step );
			break;

		case UpgradesActionTypes.TRANSACTION_RESET:
			reset();
			break;

		case UpgradesActionTypes.CART_ITEM_REMOVE:
			Dispatcher.waitFor( [ CartStore.dispatchToken ] );

			if (
				! cartItems.hasDomainRegistration( CartStore.get() ) &&
				hasDomainDetails( TransactionStore.get() )
			) {
				setDomainDetails( null );
			}
			break;
	}
} );

export default TransactionStore;
