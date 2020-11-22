/**
 * Internal dependencies
 */
import {
	TRANSACTION_DOMAIN_DETAILS_SET,
	TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET,
	TRANSACTION_PAYMENT_SET,
	TRANSACTION_RESET,
	TRANSACTION_STEP_SET,
	TRANSACTION_STRIPE_SET,
} from './action-types';
import Dispatcher from 'calypso/dispatcher';

export function setDomainDetails( domainDetails ) {
	Dispatcher.handleViewAction( {
		type: TRANSACTION_DOMAIN_DETAILS_SET,
		domainDetails,
	} );
}

export function setPayment( payment ) {
	Dispatcher.handleViewAction( {
		type: TRANSACTION_PAYMENT_SET,
		payment,
	} );
}

export function setStripeObject( stripe, stripeConfiguration ) {
	Dispatcher.handleViewAction( {
		type: TRANSACTION_STRIPE_SET,
		stripe,
		stripeConfiguration,
	} );
}

export function setNewCreditCardDetails( options ) {
	const { rawDetails, maskedDetails } = options;

	Dispatcher.handleViewAction( {
		type: TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET,
		rawDetails,
		maskedDetails,
	} );
}

export function setTransactionStep( step ) {
	Dispatcher.handleViewAction( {
		type: TRANSACTION_STEP_SET,
		step,
	} );
}

export function resetTransaction() {
	Dispatcher.handleViewAction( {
		type: TRANSACTION_RESET,
	} );
}
