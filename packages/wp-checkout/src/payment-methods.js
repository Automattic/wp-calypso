/* @format */

/**
 * External dependencies
 */
import { useContext } from 'react';

/**
 * Internal dependencies
 */
import { CheckoutContext } from './components/checkout-context';

const paymentMethods = [];

export function registerPaymentMethod( { id, button, form, billingContactForm, submit } ) {
	paymentMethods.push( { id, button, form, billingContactForm, submit } );
}

export function getPaymentMethods() {
	return paymentMethods;
}

export function usePaymentMethod() {
	const { paymentMethod } = useContext( CheckoutContext );
	return paymentMethod;
}
