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

export function usePaymentState( handler ) {
	const [ paymentData, setPaymentData ] = useState( {} );
	const dispatch = useCallback(
		( { type, payload } ) => {
			console.log( 'dispatch', type, payload ); // eslint-disable-line no-console
			const next = () =>
				setPaymentData( currentData => {
					const newState = { ...currentData, ...payload };
					console.log( 'new state', newState ); // eslint-disable-line no-console
					return newState;
				} );
			if ( ! handler ) {
				next();
			}
			if ( handler ) {
				handler( { type, payload }, dispatch, next );
			}
		},
		[ handler ]
	);
	return [ paymentData, dispatch ];
}

loadPaymentMethods();
