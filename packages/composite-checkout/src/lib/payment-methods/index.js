/**
 * External dependencies
 */
import { useContext } from 'react';

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
	if ( ! setPaymentMethodId ) {
		throw new Error( 'usePaymentMethodId can only be used inside a CheckoutProvider' );
	}
	return [ paymentMethodId, setPaymentMethodId ];
}

export function usePaymentMethod() {
	const { paymentMethodId, setPaymentMethodId } = useContext( CheckoutContext );
	if ( ! setPaymentMethodId ) {
		throw new Error( 'usePaymentMethodId can only be used inside a CheckoutProvider' );
	}
	if ( ! paymentMethodId ) {
		return null;
	}
	const paymentMethod = getPaymentMethods().find( ( { id } ) => id === paymentMethodId );
	if ( ! paymentMethod ) {
		throw new Error( `No payment method found matching id '${ paymentMethodId }'` );
	}
	return paymentMethod;
}

export function usePaymentData() {
	const { paymentData, dispatchPaymentAction } = useContext( CheckoutContext );
	if ( ! dispatchPaymentAction ) {
		throw new Error( 'usePaymentData can only be used inside a CheckoutProvider' );
	}
	return [ paymentData, dispatchPaymentAction ];
}

loadPaymentMethods();
