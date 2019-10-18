/* @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { registerPaymentMethod } from '../../lib/payment-methods';
import { ApplePayBillingForm, ApplePaySubmitButton, ApplePayLabel } from './apple-pay';

export default function loadPaymentMethods() {
	registerPaymentMethod( {
		id: 'apple-pay',
		LabelComponent: ApplePayLabel,
		PaymentMethodComponent: () => null,
		BillingContactComponent: ApplePayBillingForm,
		SubmitButtonComponent: ApplePaySubmitButton,
	} );

	registerPaymentMethod( {
		id: 'card',
		LabelComponent: () => <span>Credit Card</span>,
		PaymentMethodComponent: () => <div>Enter card info here</div>,
		BillingContactComponent: () => <div>Put payment info here</div>,
		SubmitButtonComponent: () => <button>Pay</button>,
	} );

	registerPaymentMethod( {
		id: 'paypal',
		LabelComponent: () => <span>PayPal</span>,
		PaymentMethodComponent: () => null,
		BillingContactComponent: () => <div>Put payment info here</div>,
		SubmitButtonComponent: () => <button>Pay</button>,
	} );
}
