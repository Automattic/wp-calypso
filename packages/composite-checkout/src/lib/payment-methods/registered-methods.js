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
import BillingFields from '../../components/billing-fields';

export default function loadPaymentMethods() {
	registerPaymentMethod( {
		id: 'apple-pay',
		LabelComponent: ApplePayLabel,
		PaymentMethodComponent: () => null,
		BillingContactComponent: BillingFields,
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

export function getAriaLabelForPaymentMethodSelector( methodSlug, localize ) {
	switch ( methodSlug ) {
		case 'apple-pay':
			return localize( 'Check out with Apple Pay' );
		case 'card':
			return localize( 'Check out with a credit card' );
		case 'paypal':
			return localize( 'Check out with PayPal' );
		default:
			throw new Error( `Unrecognized payment method slug ${ methodSlug }` );
	}
}
