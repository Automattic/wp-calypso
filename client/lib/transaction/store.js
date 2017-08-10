/**
 * External dependencies
 */
import { assign, cloneDeep, merge } from 'lodash';

var update = require( 'react-addons-update' );

/**
 * Internal dependencies
 */
var UpgradesActionTypes = require( 'lib/upgrades/constants' ).action,
	cartItems = require( 'lib/cart-values' ).cartItems,
	CartStore = require( 'lib/cart/store' ),
	Emitter = require( 'lib/mixins/emitter' ),
	Dispatcher = require( 'dispatcher' ),
	transactionStepTypes = require( 'lib/store-transactions/step-types' ),
	hasDomainDetails = require( 'lib/store-transactions' ).hasDomainDetails;

var _transaction = createInitialTransaction();

var TransactionStore = {
	get: function() {
		return _transaction;
	}
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
		step: { name: transactionStepTypes.BEFORE_SUBMIT },
		domainDetails: null
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
	replaceData( assign( {}, _transaction, {
		step: step,
		errors: ( step.error ? step.error.message : {} )
	} ) );
}

function setNewCreditCardDetails( options ) {
	if ( ! _transaction.payment.newCardDetails ) {
		return;
	}

	var newTransaction = update( _transaction, {
		payment: { newCardDetails: { $merge: options.rawDetails } },
		newCardFormFields: { $merge: options.maskedDetails }
	} );

	replaceData( newTransaction );
}

TransactionStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

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
				maskedDetails: action.maskedDetails
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

			if ( ! cartItems.hasDomainRegistration( CartStore.get() ) && hasDomainDetails( TransactionStore.get() ) ) {
				setDomainDetails( null );
			}
			break;
	}
} );

module.exports = TransactionStore;
