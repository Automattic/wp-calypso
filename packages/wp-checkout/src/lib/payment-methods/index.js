/* @format */

/**
 * External dependencies
 */
import { useContext } from 'react';

/**
 * Internal dependencies
 */
import { CheckoutContext } from '../../components/checkout-context';
import loadPaymentMethods from './registered-methods';

const paymentMethods = [];

export function registerPaymentMethod( {
	id,
	initialData,
	LabelComponent,
	PaymentMethodComponent,
	BillingContactComponent,
	SubmitButtonComponent,
} ) {
	// TODO: add validation
	paymentMethods.push( {
		id,
		initialData,
		LabelComponent,
		PaymentMethodComponent,
		BillingContactComponent,
		SubmitButtonComponent,
	} );
}

export function getPaymentMethods() {
	return paymentMethods;
}

export function usePaymentMethod() {
	const { paymentMethod } = useContext( CheckoutContext );
	return paymentMethod;
}

loadPaymentMethods();
