/**
 * Internal dependencies
 */
import { action as ActionTypes } from '../constants';
import Dispatcher from 'dispatcher';
import storeTransactions from 'lib/store-transactions';

function setDomainDetails( domainDetails ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.SET_TRANSACTION_DOMAIN_DETAILS,
		domainDetails
	} );
}

function setPayment( payment ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.SET_TRANSACTION_PAYMENT,
		payment
	} );
}

function setNewCreditCardDetails( options ) {
	const { rawDetails, maskedDetails } = options;

	Dispatcher.handleViewAction( {
		type: ActionTypes.SET_TRANSACTION_NEW_CREDIT_CARD_DETAILS,
		rawDetails,
		maskedDetails
	} );
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
		type: ActionTypes.RESET_TRANSACTION
	} );
}

export {
	resetTransaction,
	setDomainDetails,
	setNewCreditCardDetails,
	setPayment,
	submitTransaction
};
