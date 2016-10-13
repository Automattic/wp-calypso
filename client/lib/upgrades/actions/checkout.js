/**
 * Internal dependencies
 */
import { action as ActionTypes } from '../constants';
import Dispatcher from 'dispatcher';
import storeTransactions from 'lib/store-transactions';

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

function submitTransaction( { cart, transaction }, onComplete ) {
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

		if ( onComplete && step.name === 'received-wpcom-response' ) {
			onComplete( step.error, step.data );
		}
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
	submitTransaction
};
