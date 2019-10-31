/**
 * External dependencies
 */
import { useState, useContext, useCallback } from 'react';

/**
 * Internal dependencies
 */
import CheckoutContext from '../checkout-context';
import loadPaymentMethods from './registered-methods';

const paymentMethods = [];

export function registerPaymentMethod( {
	id,
	LabelComponent,
	PaymentMethodComponent,
	BillingContactComponent,
	SubmitButtonComponent,
	CheckoutWrapper,
} ) {
	if (
		! id ||
		! LabelComponent ||
		! PaymentMethodComponent ||
		! BillingContactComponent ||
		! SubmitButtonComponent
	) {
		throw new Error( 'registerPaymentMethod called with missing data' );
	}
	paymentMethods.push( {
		id,
		LabelComponent,
		PaymentMethodComponent,
		BillingContactComponent,
		SubmitButtonComponent,
		CheckoutWrapper,
	} );
}

export function getPaymentMethods() {
	return paymentMethods;
}

export function usePaymentMethodId() {
	const { paymentMethodId, setPaymentMethodId } = useContext( CheckoutContext );
	return [ paymentMethodId, setPaymentMethodId ];
}

export function usePaymentMethod() {
	const { paymentMethodId } = useContext( CheckoutContext );
	if ( ! paymentMethodId ) {
		return null;
	}
	const paymentMethod = getPaymentMethods().find( ( { id } ) => id === paymentMethodId );
	if ( ! paymentMethod ) {
		throw new Error( `No payment method found matching id '${ paymentMethodId }'` );
	}
	return paymentMethod;
}

export function usePaymentMethodData() {
	const { paymentData, dispatchPaymentAction } = useContext( CheckoutContext );
	return [ paymentData, dispatchPaymentAction ];
}

export function usePaymentState( hostHandler ) {
	const [ paymentData, setPaymentData ] = useState( {} );
	const dispatch = useCallback(
		action => {
			console.log( 'dispatch', action ); // eslint-disable-line no-console
			const next = () => paymentStateHandler( action, dispatch, setPaymentData );
			if ( ! hostHandler ) {
				next();
			}
			if ( hostHandler ) {
				hostHandler( action, dispatch, next );
			}
		},
		[ hostHandler ]
	);
	return [ paymentData, dispatch ];
}

function paymentStateHandler( { type, payload }, dispatch, setPaymentData ) {
	switch ( type ) {
		case 'STEP_CHANGED':
			// noop
			return;
		case 'PAYMENT_DATA_UPDATE':
			setPaymentData( currentData => {
				const newState = { ...currentData, ...payload };
				console.log( 'new state', newState ); // eslint-disable-line no-console
				return newState;
			} );
			return;
		case 'STRIPE_CONFIGURATION_SET':
			dispatch( { type: 'PAYMENT_DATA_UPDATE', payload: { stripeConfiguration: payload } } );
			return;
		case 'STRIPE_TRANSACTION_END':
			dispatch( { type: 'PAYMENT_DATA_UPDATE', payload: { stripeTransactionStatus: 'complete' } } );
			return;
		case 'STRIPE_TRANSACTION_AUTH':
			dispatch( { type: 'PAYMENT_DATA_UPDATE', payload: { stripeTransactionStatus: 'auth' } } );
			return;
		case 'STRIPE_TRANSACTION_REDIRECT':
			dispatch( { type: 'PAYMENT_DATA_UPDATE', payload: { stripeTransactionStatus: 'redirect' } } );
			return;
		case 'STRIPE_TRANSACTION_ERROR':
			dispatch( {
				type: 'PAYMENT_DATA_UPDATE',
				payload: { stripeTransactionStatus: 'error', stripeTransactionError: payload },
			} );
			return;
		case 'STRIPE_TRANSACTION_RESPONSE':
			if ( payload && payload.message && payload.message.payment_intent_client_secret ) {
				dispatch( { type: 'STRIPE_TRANSACTION_AUTH', payload } );
				return;
			}
			if ( payload && payload.redirect_url ) {
				dispatch( { type: 'STRIPE_TRANSACTION_REDIRECT', payload } );
				return;
			}
			dispatch( { type: 'STRIPE_TRANSACTION_END', payload } );
			return;
		case 'STRIPE_CONFIGURATION_FETCH':
		case 'STRIPE_TRANSACTION_BEGIN':
			throw new Error( `The action '${ type }' must be handled by the host page` );
		default:
			throw new Error( `Unknown action type '${ type }'` );
	}
}

loadPaymentMethods();
