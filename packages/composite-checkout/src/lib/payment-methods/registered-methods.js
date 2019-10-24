/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { registerPaymentMethod } from '../../lib/payment-methods';
import { ApplePayBillingForm, ApplePaySubmitButton, ApplePayLabel } from './apple-pay';
import { StripeHookProvider } from '../../lib/stripe';
import StripeCreditCardFields from '../../components/stripe-credit-card-fields';

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
		PaymentMethodComponent: StripeCreditCardFields,
		BillingContactComponent: ApplePayBillingForm,
		SubmitButtonComponent: () => <button>Pay</button>,
		CheckoutWrapper: StripeHookProvider,
	} );

	registerPaymentMethod( {
		id: 'paypal',
		LabelComponent: () => <span>PayPal</span>,
		PaymentMethodComponent: () => null,
		BillingContactComponent: ApplePayBillingForm, // TODO: replace this
		SubmitButtonComponent: () => <button>Pay</button>,
	} );
}
