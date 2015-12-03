/**
 * External dependencies
 */
var cloneDeep = require( 'lodash/lang/cloneDeep' ),
	mergeDeep = require( 'lodash/object/merge' ),
	extend = require( 'lodash/object/assign' ),
	React = require( 'react/addons' );

/**
 * Internal dependencies
 */
var UpgradesActionTypes = require( 'lib/upgrades/constants' ).action,
	cartItems = require( 'lib/cart-values' ).cartItems,
	CartStore = require( 'lib/cart/store' ),
	Emitter = require( 'lib/mixins/emitter' ),
	Dispatcher = require( 'dispatcher' ),
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
		step: { name: 'before-submit' },
		domainDetails: null
	};
}

function reset() {
	replaceData( createInitialTransaction() );
}

function setDomainDetails( domainDetails ) {
	replaceData( mergeDeep( _transaction, { domainDetails: domainDetails } ) );
}

function setPayment( payment ) {
	replaceData( extend( {}, _transaction, { payment: payment } ) );
}

function setStep( step ) {
	replaceData( extend( {}, _transaction, {
		step: step,
		errors: ( step.error ? step.error.message : {} )
	} ) );
}

function setNewCreditCardDetails( options ) {
	if ( ! _transaction.payment.newCardDetails ) {
		return;
	}

	var newTransaction = React.addons.update( _transaction, {
		payment: { newCardDetails: { $merge: options.rawDetails } },
		newCardFormFields: { $merge: options.maskedDetails }
	} );

	replaceData( newTransaction );
}

TransactionStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	switch ( action.type ) {
		case UpgradesActionTypes.SET_TRANSACTION_DOMAIN_DETAILS:
			setDomainDetails( action.domainDetails );
			break;

		case UpgradesActionTypes.SET_TRANSACTION_PAYMENT:
			setPayment( action.payment );
			break;

		case UpgradesActionTypes.SET_TRANSACTION_NEW_CREDIT_CARD_DETAILS:
			setNewCreditCardDetails( {
				rawDetails: action.rawDetails,
				maskedDetails: action.maskedDetails
			} );
			break;

		case UpgradesActionTypes.TRANSACTION_STEP_SET:
			setStep( action.step );
			break;

		case UpgradesActionTypes.RESET_TRANSACTION:
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
