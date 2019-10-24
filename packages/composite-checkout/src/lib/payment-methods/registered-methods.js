/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { registerPaymentMethod } from '../../lib/payment-methods';
import { ApplePayBillingForm, ApplePaySubmitButton, ApplePayLabel } from './apple-pay';
import { PaypalLabel, PaypalSubmitButton } from './paypal';
import { CreditCardLabel, CreditCardSubmitButton } from './credit-card';
import CreditCardFields from '../../components/credit-card-fields';

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
		LabelComponent: CreditCardLabel,
		PaymentMethodComponent: ( { isActive } ) => ( isActive ? <CreditCardFields /> : null ),
		BillingContactComponent: ApplePayBillingForm, // TODO: replace this
		SubmitButtonComponent: CreditCardSubmitButton,
	} );

	registerPaymentMethod( {
		id: 'paypal',
		LabelComponent: PaypalLabel,
		PaymentMethodComponent: () => null,
		BillingContactComponent: ApplePayBillingForm, // TODO: replace this
		SubmitButtonComponent: PaypalSubmitButton,
	} );
}
