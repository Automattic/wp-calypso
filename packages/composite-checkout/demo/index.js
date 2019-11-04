require( '@babel/polyfill' );

/**
 * External dependencies
 */
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Checkout, CheckoutProvider } from '../src/public-api';
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
			sendStripeTransaction( formatDataForStripeTransaction( payload ) )
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

	return (
		<CheckoutProvider
			locale={ 'US' }
			items={ items }
			total={ total }
			onSuccess={ onSuccess }
			onFailure={ onFailure }
			successRedirectUrl={ successRedirectUrl }
			failureRedirectUrl={ failureRedirectUrl }
			eventHandler={ handleCheckoutEvent }
		>
			<Checkout />
		</CheckoutProvider>
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

function formatDataForStripeTransaction( {
	items,
	total,
	country,
	postalCode,
	subdivisionCode,
	paymentData,
	stripePaymentMethod,
	stripeConfiguration,
	successUrl,
	cancelUrl,
} ) {
	const siteId = ''; // TODO: get site id
	const couponId = null; // TODO: get couponId
	const payment = {
		payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
		payment_key: stripePaymentMethod.id,
		payment_partner: stripeConfiguration.processor_id,
		name,
		zip: postalCode,
		country,
		successUrl,
		cancelUrl,
	};
	return {
		cart: createCartFromLineItems( {
			siteId,
			couponId,
			items,
			total,
			country,
			postalCode,
			subdivisionCode,
		} ),
		domain_details: getDomainDetailsFromPaymentData( paymentData ),
		payment,
	};
}

function createCartFromLineItems( {
	siteId,
	couponId,
	items,
	country,
	postalCode,
	subdivisionCode,
} ) {
	// TODO: use cart manager to create cart object needed for this transaction
	const currency = items.reduce( ( value, item ) => value || item.amount.currency );
	return {
		blog_id: siteId,
		coupon: couponId || '',
		currency: currency || '',
		temporary: false,
		extra: [],
		products: items.map( item => ( {
			product_id: item.id,
			meta: '', // TODO: get this for domains, etc
			cost: item.amount.value, // TODO: how to convert this from 3500 to 35?
			currency: item.amount.currency,
			volume: 1,
		} ) ),
		tax: {
			location: {
				country_code: country,
				postal_code: postalCode,
				subdivision_code: subdivisionCode,
			},
		},
	};
}

function getDomainDetailsFromPaymentData( paymentData ) {
	const { billing = {}, domains = {}, isDomainContactSame = true } = paymentData;
	return {
		first_name: isDomainContactSame ? billing.name : domains.name || billing.name || '',
		last_name: isDomainContactSame ? billing.name : domains.name || billing.name || '', // TODO: how do we split up first/last name?
		address_1: isDomainContactSame ? billing.address : domains.address || billing.address || '',
		city: isDomainContactSame ? billing.city : domains.city || billing.city || '',
		state: isDomainContactSame
			? billing.state || billing.province
			: domains.state || domains.province || billing.state || billing.province || '',
		postal_code: isDomainContactSame
			? billing.postalCode || billing.zipCode
			: domains.postalCode || domains.zipCode || billing.postalCode || billing.zipCode || '',
		country_code: isDomainContactSame ? billing.country : domains.country || billing.country || '',
		email: isDomainContactSame ? billing.email : domains.email || billing.email || '', // TODO: we need to get email address
		phone: isDomainContactSame ? '' : domains.phoneNumber || '',
	};
}

ReactDOM.render( <MyCheckout />, document.getElementById( 'root' ) );
