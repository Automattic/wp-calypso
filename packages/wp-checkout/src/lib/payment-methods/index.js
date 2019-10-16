/* @format */

/**
 * External dependencies
 */
import { useContext, useState } from 'react';

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

export function usePaymentMethodData() {
	// TODO: put initialData in here from paymentMethod defintion? or get rid of it.
	const { paymentMethodData, setPaymentMethodData } = useContext( CheckoutContext );
	const paymentMethodId = usePaymentMethod();
	const setData = newData =>
		setPaymentMethodData( { ...paymentMethodData, [ paymentMethodId ]: newData } );
	return [ paymentMethodData[ paymentMethodId ], setData ];
}

loadPaymentMethods();
