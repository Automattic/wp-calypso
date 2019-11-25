// This is required to fix the "regeneratorRuntime is not defined" error
require( '@babel/polyfill' );

/**
 * External dependencies
 */
import React, { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import ReactDOM from 'react-dom';
import {
	Checkout,
	CheckoutProvider,
	createRegistry,
	createStripeMethod,
	createPayPalMethod,
	createApplePayMethod,
	createCreditCardMethod,
	useIsStepActive,
	usePaymentData,
	getDefaultPaymentMethodStep,
	getDefaultOrderSummaryStep,
	getDefaultOrderReviewStep,
} from '../src/public-api';
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

async function makePayPalExpressRequest() {
	// return this.wpcom.req.post( '/me/paypal-express-url', data );
	return window.location.href;
}

const registry = createRegistry();
const { registerStore, select, subscribe } = registry;

const stripeMethod = createStripeMethod( {
	registerStore,
	fetchStripeConfiguration,
	sendStripeTransaction,
} );

const creditCardMethod = createCreditCardMethod();

const applePayMethod = isApplePayAvailable()
	? createApplePayMethod( {
			registerStore,
			fetchStripeConfiguration,
	  } )
	: null;

const paypalMethod = createPayPalMethod( { registerStore, makePayPalExpressRequest } );

export function isApplePayAvailable() {
	// Our Apple Pay implementation uses the Payment Request API, so check that first.
	if ( ! window.PaymentRequest ) {
		return false;
	}

	// Check if Apple Pay is available. This can be very expensive on certain
	// Safari versions due to a bug (https://trac.webkit.org/changeset/243447/webkit),
	// and there is no way it can change during a page request, so cache the
	// result.
	if ( typeof isApplePayAvailable.canMakePayments === 'undefined' ) {
		try {
			isApplePayAvailable.canMakePayments = Boolean(
				window.ApplePaySession && window.ApplePaySession.canMakePayments()
			);
		} catch ( error ) {
			console.error( error ); // eslint-disable-line no-console
			return false;
		}
	}
	return isApplePayAvailable.canMakePayments;
}

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

// Replace this with the host page's translation system
const useLocalize = () => text => text;
const hostTranslate = text => text;

const ContactFormTitle = () => {
	const localize = useLocalize();
	const isActive = useIsStepActive();
	return isActive ? localize( 'Enter your billing details' ) : localize( 'Billing details' );
};

const Label = styled.label`
	display: block;
	color: ${props => props.theme.colors.textColor};
	font-weight: ${props => props.theme.weights.bold};
	font-size: 14px;
	margin-bottom: 8px;

	:hover {
		cursor: ${props => ( props.disabled ? 'default' : 'pointer' )};
	}
`;

const Input = styled.input`
	display: block;
	width: 100%;
	box-sizing: border-box;
	font-size: 16px;
	border: 1px solid
		${props => ( props.isError ? props.theme.colors.error : props.theme.colors.borderColor )};
	padding: 13px 10px 12px 10px;

	:focus {
		outline: ${props => ( props.isError ? props.theme.colors.error : props.theme.colors.outline )}
			solid 2px !important;
	}
`;

const Form = styled.div`
	margin-bottom: 0.5em;
`;

function ContactForm( { summary } ) {
	const [ paymentData, changePaymentData ] = usePaymentData();
	const { billing = {} } = paymentData;
	const { country = '' } = billing;
	const onChangeCountry = event =>
		changePaymentData( 'billing', { ...billing, country: event.target.value } );
	if ( summary ) {
		return (
			<div>
				<div>Country</div>
				<span>{ country }</span>
			</div>
		);
	}
	return (
		<Form>
			<Label htmlFor="country">Country</Label>
			<Input id="country" type="text" value={ country } onChange={ onChangeCountry } />
		</Form>
	);
}

const steps = [
	getDefaultOrderSummaryStep(),
	{
		...getDefaultPaymentMethodStep(),
		getEditButtonAriaLabel: () => hostTranslate( 'Edit the payment method' ),
		getNextStepButtonAriaLabel: () => hostTranslate( 'Continue with the selected payment method' ),
	},
	{
		id: 'contact-form',
		className: 'checkout__billing-details-step',
		hasStepNumber: true,
		titleContent: <ContactFormTitle />,
		activeStepContent: <ContactForm />,
		completeStepContent: <ContactForm summary />,
		isCompleteCallback: ( { paymentData } ) => {
			const { billing = {} } = paymentData;
			if ( ! billing.country ) {
				return false;
			}
			return true;
		},
		isEditableCallback: ( { paymentData } ) => {
			if ( paymentData.billing ) {
				return true;
			}
			return false;
		},
		getEditButtonAriaLabel: () => hostTranslate( 'Edit the billing details' ),
		getNextStepButtonAriaLabel: () => hostTranslate( 'Continue with the entered billing details' ),
	},
	getDefaultOrderReviewStep(),
];

// This is the parent component which would be included on a host page
function MyCheckout() {
	const [ items, setItems ] = useState( initialItems );
	useEffect( () => {
		subscribe( handleEvent( setItems ) );
	}, [] );
	const total = useMemo( () => getTotal( items ), [ items ] );

	return (
		<CheckoutProvider
			locale={ 'en' }
			items={ items }
			total={ total }
			onSuccess={ onSuccess }
			onFailure={ onFailure }
			successRedirectUrl={ successRedirectUrl }
			failureRedirectUrl={ failureRedirectUrl }
			registry={ registry }
			paymentMethods={ [ applePayMethod, creditCardMethod, stripeMethod, paypalMethod ].filter(
				Boolean
			) }
		>
			<Checkout steps={ steps } />
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
