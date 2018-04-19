/** @format */
/**
 * External dependencies
 */
import { defer } from 'lodash';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from '../constants';
import Dispatcher from 'dispatcher';
import { submit } from 'lib/store-transactions';

export function setDomainDetails( domainDetails ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.TRANSACTION_DOMAIN_DETAILS_SET,
		domainDetails,
	} );
}

export function setPayment( payment ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.TRANSACTION_PAYMENT_SET,
		payment,
	} );
}

export function setNewCreditCardDetails( options ) {
	const { rawDetails, maskedDetails } = options;

	Dispatcher.handleViewAction( {
		type: ActionTypes.TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET,
		rawDetails,
		maskedDetails,
	} );
}

export function submitTransaction( { cart, transaction, successUrl, cancelUrl }, onComplete ) {
	submit(
		{
			cart: cart,
			payment: transaction.payment,
			domainDetails: transaction.domainDetails,
			successUrl,
			cancelUrl,
		},
		// Execute every step handler in its own event loop tick, so that a complete React
		// rendering cycle happens on each step and `componentWillReceiveProps` of objects
		// like the `TransactionStepsMixin` are called with every step.
		step =>
			defer( () => {
				Dispatcher.handleViewAction( {
					type: ActionTypes.TRANSACTION_STEP_SET,
					step,
				} );

				if ( onComplete && step.name === 'received-wpcom-response' ) {
					onComplete( step.error, step.data );
				}
			} )
	);
}

export function resetTransaction() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.TRANSACTION_RESET,
	} );
}
