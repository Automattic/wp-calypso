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
	labelComponent,
	paymentMethodComponent,
	billingContactComponent,
	submitButtonComponent,
} ) {
	paymentMethods.push( {
		id,
		initialData,
		labelComponent,
		paymentMethodComponent,
		billingContactComponent,
		submitButtonComponent,
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
