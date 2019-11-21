// This is required to fix the "regeneratorRuntime is not defined" error
require( '@babel/polyfill' );

/**
 * External dependencies
 */
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import {
	Checkout,
	CheckoutProvider,
	createRegistry,
	createStripeMethod,
	createPayPalMethod,
	createApplePayMethod,
	createCreditCardMethod,
	CheckoutPaymentMethods,
	useActiveStep,
	WPCheckoutOrderSummary,
	WPCheckoutOrderSummaryTitle,
	WPCheckoutOrderReview,
	WPContactForm,
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

// TODO: replace this with the host page's translation system
const useLocalize = () => text => text;

const CheckoutPaymentMethodsTitle = () => {
	const localize = useLocalize();
	const currentStep = useActiveStep();
	const isActive = currentStep.id === 'payment-method';
	return isActive ? localize( 'Payment method' ) : localize( 'Pick a payment method' );
};

const ContactFormTitle = () => {
	const localize = useLocalize();
	const currentStep = useActiveStep();
	const isActive = currentStep.id === 'payment-method';
	return isActive ? localize( 'Billing details' ) : localize( 'Enter your billing details' );
};

const OrderReviewTitle = () => {
	const localize = useLocalize();
	return localize( 'Review your order' );
};

const steps = [
	{
		id: 'order-summary',
		className: 'checkout__order-summary-step',
		hasStepNumber: false,
		titleContent: <WPCheckoutOrderSummaryTitle />,
		activeStepContent: null,
		incompleteStepContent: null,
		completeStepContent: <WPCheckoutOrderSummary />,
		isCompleteCallback: () => true,
	},
	{
		// TODO: Export this whole step from the package
		id: 'payment-method',
		className: 'checkout__payment-methods-step',
		hasStepNumber: true,
		titleContent: <CheckoutPaymentMethodsTitle />,
		activeStepContent: <CheckoutPaymentMethods isComplete={ false } />,
		incompleteStepContent: null,
		completeStepContent: <CheckoutPaymentMethods summary isComplete={ true } />,
		isCompleteCallback: () => true, // TODO: make sure any required fields in the selected payment method are complete
		isEditableCallback: () => true,
		getEditButtonAriaLabel: localize => localize( 'Edit the payment method' ),
		getNextStepButtonLabel: localize => localize( 'Continue with the selected payment method' ),
	},
	{
		id: 'contact-form',
		className: 'checkout__billing-details-step',
		hasStepNumber: true,
		titleContent: <ContactFormTitle />,
		activeStepContent: <WPContactForm isComplete={ false } isActive={ true } />,
		incompleteStepContent: null,
		completeStepContent: <WPContactForm summary isComplete={ true } isActive={ false } />,
		isCompleteCallback: () => true, // TODO: Make sure the form is complete
		isEditableCallback: () => true,
		getEditButtonAriaLabel: localize => localize( 'Edit the billing details' ), // TODO: somehow use the host's translation system because this will not work
		getNextStepButtonLabel: localize => localize( 'Continue with the entered billing details' ), // TODO: somehow use the host's translation system because this will not work
	},
	{
		id: 'order-review',
		className: 'checkout__review-order-step',
		hasStepNumber: true,
		titleContent: <OrderReviewTitle />,
		activeStepContent: <WPCheckoutOrderReview />,
		incompleteStepContent: null,
		completeStepContent: null,
		isCompleteCallback: () => true,
	},
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
