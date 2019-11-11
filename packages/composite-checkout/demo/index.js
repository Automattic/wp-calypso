// This is required to fix the "regeneratorRuntime is not defined" error
require( '@babel/polyfill' );

/**
 * External dependencies
 */
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Checkout, CheckoutProvider, registerStore, subscribe, select } from '../src/public-api';
import { createStripeMethod } from '../src/components/stripe-credit-card-fields';
import { createApplePayMethod } from '../src/lib/payment-methods/apple-pay';
import { createPayPalMethod } from '../src/lib/payment-methods/paypal';
import { createCreditCardMethod } from '../src/lib/payment-methods/credit-card';
import { stripeKey } from './private';
import WPCheckoutOrderSummary from '../src/components/wp-checkout-order-summary';
import WPCheckoutOrderReview from '../src/components/wp-checkout-order-review';

const initialItems = [
	{
		label: 'WordPress.com Personal Plan',
		id: 'wpcom-personal',
		type: 'plan',
		amount: { currency: 'USD', value: 6000, displayValue: '$60' },
	},
	{
		label: 'Domain registration',
		subLabel: 'example.com',
		id: 'wpcom-domain',
		type: 'domain',
		amount: { currency: 'USD', value: 0, displayValue: '~~$17~~ 0' },
	},
];

// These are used only for non-redirect payment methods
const onSuccess = () => window.alert( 'Payment succeeded!' );
const onFailure = error => window.alert( 'There was a problem with your payment: ' + error );

// These are used only for redirect payment methods
const successRedirectUrl = window.location.href;
const failureRedirectUrl = window.location.href;

async function fetchStripeConfiguration() {
	// return await wpcom.req.get( '/me/stripe-configuration', query );
	return {
		public_key: stripeKey,
		js_url: 'https://js.stripe.com/v3/',
	};
}

async function sendStripeTransaction() {
	// return await wpcom.req.post( '/me/transactions', transaction );
	return {
		success: true,
	};
}

async function makePayPalExpressRequest() {
	// return this.wpcom.req.post( '/me/paypal-express-url', data );
	return window.location.href;
}

const stripeMethod = createStripeMethod( {
	registerStore,
	fetchStripeConfiguration,
	sendStripeTransaction,
} );

const creditCardMethod = createCreditCardMethod();

const applePayMethod = createApplePayMethod();

const paypalMethod = createPayPalMethod( { registerStore, makePayPalExpressRequest } );

const handleEvent = setItems => () => {
	const cardholderName = select( 'stripe' ).getCardholderName();
	if ( cardholderName === 'admin' ) {
		setItems( items =>
			items.map( item => ( { ...item, amount: { ...item.amount, value: 0, displayValue: '0' } } ) )
		);
	}
};

const getTotal = items => {
	const lineItemTotal = items.reduce( ( sum, item ) => sum + item.amount.value, 0 );
	const currency = items.reduce( ( lastCurrency, item ) => item.amount.currency, 'USD' );
	return {
		label: 'Total',
		amount: {
			currency,
			value: lineItemTotal,
			displayValue: formatValueForCurrency( currency, lineItemTotal ),
		},
	};
};

// This is the parent component which would be included on a host page
function MyCheckout() {
	const [ items, setItems ] = useState( initialItems );
	useEffect( () => {
		subscribe( handleEvent( setItems ) );
	}, [] );
	const total = useMemo( () => getTotal( items ), [ items ] );

	return (
		<CheckoutProvider
			locale={ 'US' }
			items={ items }
			total={ total }
			onSuccess={ onSuccess }
			onFailure={ onFailure }
			successRedirectUrl={ successRedirectUrl }
			failureRedirectUrl={ failureRedirectUrl }
			paymentMethods={ [ applePayMethod, creditCardMethod, stripeMethod, paypalMethod ] }
		>
			<Checkout OrderSummary={ WPCheckoutOrderSummary } ReviewContent={ WPCheckoutOrderReview } />
		</CheckoutProvider>
	);
}

function formatValueForCurrency( currency, value ) {
	if ( currency !== 'USD' ) {
		throw new Error( `Unsupported currency ${ currency }'` );
	}
	const floatValue = value / 100;
	return '$' + floatValue.toString();
}

ReactDOM.render( <MyCheckout />, document.getElementById( 'root' ) );
