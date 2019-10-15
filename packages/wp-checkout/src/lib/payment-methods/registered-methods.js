/* @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { registerPaymentMethod } from '../../lib/payment-methods';

export default function loadPaymentMethods() {
	registerPaymentMethod( {
		id: 'apple-pay',
		button: <span>Apple Pay</span>,
		form: ( { isActive } ) => ( isActive ? 'Apple Pay' : null ),
		billingContactForm: null,
		submit: () => {},
	} );

	registerPaymentMethod( {
		id: 'card',
		button: <span>Credit Card</span>,
		form: null,
		billingContactForm: null,
		submit: () => {},
	} );

	registerPaymentMethod( {
		id: 'paypal',
		button: <span>Paypal</span>,
		form: ( { isActive } ) => ( isActive ? 'Paypal' : null ),
		billingContactForm: null,
		submit: () => {},
	} );
}
