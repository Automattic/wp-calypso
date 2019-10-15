/* @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { registerPaymentMethod } from '../../lib/payment-methods';
import { useLocalize } from '../../lib/localize';
import { useCheckoutLineItems, renderDisplayValueMarkdown } from '../../index';

export default function loadPaymentMethods() {
	registerPaymentMethod( {
		id: 'apple-pay',
		initialData: {},
		labelComponent: <span>Apple Pay</span>,
		paymentMethodComponent: ApplePayComponent,
		billingContactComponent: ApplePayBillingForm,
		submitButtonComponent: ApplePaySubmitButton,
	} );

	registerPaymentMethod( {
		id: 'card',
		initialData: {},
		labelComponent: <span>Credit Card</span>,
		paymentMethodComponent: <div>Enter card info here</div>,
		billingContactComponent: <div>Put payment info here</div>,
		submitButtonComponent: <button>Pay</button>,
	} );

	registerPaymentMethod( {
		id: 'paypal',
		initialData: {},
		labelComponent: <span>Paypal</span>,
		paymentMethodComponent: <div></div>,
		billingContactComponent: <div>Put payment info here</div>,
		submitButtonComponent: <button>Pay</button>,
	} );
}

function ApplePayComponent( { isActive } ) {
	return isActive ? 'Apple Pay' : null;
}

function ApplePayBillingForm() {}

function ApplePaySubmitButton() {
	const localize = useLocalize();
	const [ , total ] = useCheckoutLineItems();
	return (
		<button>{ localize( `Pay ${ renderDisplayValueMarkdown( total.displayValue ) }` ) }</button>
	);
}
