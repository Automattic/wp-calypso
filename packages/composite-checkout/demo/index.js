require( '@babel/polyfill' );

/**
 * External dependencies
 */
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Checkout, { usePaymentState } from '../src';
import { stripeKey } from './private';

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
/* eslint-disable no-console */
const onSuccess = () => console.log( 'Payment succeeded!' );
const onFailure = error => console.error( 'There was a problem with your payment', error );
/* eslint-enable no-console */

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

function handleCheckoutEvent( { type, payload }, dispatch, next ) {
	switch ( type ) {
		case 'STRIPE_CONFIGURATION_FETCH':
			fetchStripeConfiguration( payload )
				.then( stripeConfiguration =>
					dispatch( { type: 'STRIPE_CONFIGURATION_SET', payload: stripeConfiguration } )
				)
				.catch( error => dispatch( { type: 'STRIPE_TRANSACTION_ERROR', payload: error } ) );
			return;
		case 'STRIPE_TRANSACTION_BEGIN':
			sendStripeTransaction( payload )
				.then( async response => {
					dispatch( { type: 'STRIPE_TRANSACTION_RESPONSE', payload: response } );
				} )
				.catch( error => dispatch( { type: 'STRIPE_TRANSACTION_ERROR', payload: error } ) );
			return;
	}
	next();
}

// This is the parent component which would be included on a host page
function MyCheckout() {
	const { items, total } = useShoppingCart();
	const [ paymentData, dispatchPaymentAction ] = usePaymentState( handleCheckoutEvent );

	return (
		<Checkout
			locale={ 'US' }
			items={ items }
			total={ total }
			onSuccess={ onSuccess }
			onFailure={ onFailure }
			successRedirectUrl={ successRedirectUrl }
			failureRedirectUrl={ failureRedirectUrl }
			paymentData={ paymentData }
			dispatchPaymentAction={ dispatchPaymentAction }
		/>
	);
}

// This is a very simple shopping cart manager which can calculate totals
function useShoppingCart() {
	const [ items ] = useState( initialItems );

	// The total must be calculated outside checkout and need not be related to line items
	const lineItemTotal = items.reduce( ( sum, item ) => sum + item.amount.value, 0 );
	const currency = items.reduce( ( lastCurrency, item ) => item.amount.currency, 'USD' );
	const total = {
		label: 'Total',
		amount: {
			currency,
			value: lineItemTotal,
			displayValue: formatValueForCurrency( currency, lineItemTotal ),
		},
	};

	return { items, total };
}

function formatValueForCurrency( currency, value ) {
	if ( currency !== 'USD' ) {
		throw new Error( `Unsupported currency ${ currency }'` );
	}
	const floatValue = value / 100;
	return '$' + floatValue.toString();
}

ReactDOM.render( <MyCheckout />, document.getElementById( 'root' ) );
