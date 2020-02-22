// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';

/**
 * External dependencies
 */
import React, { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import ReactDOM from 'react-dom';
import {
	Checkout,
	CheckoutSteps,
	CheckoutStep,
	CheckoutStepBody,
	CheckoutProvider,
	createApplePayMethod,
	createPayPalMethod,
	createRegistry,
	createStripeMethod,
	getDefaultOrderReviewStep,
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	useIsStepActive,
	usePaymentData,
} from '../src/public-api';
import { StripeHookProvider, useStripe } from '../src/lib/stripe';

const stripeKey = 'pk_test_zIh4nRbVgmaetTZqoG4XKxWT';

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

const onPaymentComplete = () => {
	const successRedirectUrl = '/complete.html';
	window.location.href = successRedirectUrl;
};
const onEvent = event => window.console.log( 'Event', event );
const showErrorMessage = error => {
	console.log( 'Error:', error ); /* eslint-disable-line no-console */
	window.alert( 'There was a problem with your payment: ' + error );
};
const showInfoMessage = message => {
	console.log( 'Info:', message ); /* eslint-disable-line no-console */
	window.alert( message );
};
const showSuccessMessage = message => {
	console.log( 'Success:', message ); /* eslint-disable-line no-console */
	window.alert( message );
};

async function fetchStripeConfiguration() {
	// This simulates the network request time
	await asyncTimeout( 2000 );
	return {
		public_key: stripeKey,
		js_url: 'https://js.stripe.com/v3/',
	};
}

async function sendStripeTransaction( data ) {
	window.console.log( 'Processing stripe transaction with data', data );
	// This simulates the transaction and provisioning time
	await asyncTimeout( 2000 );
	return {
		success: true,
	};
}

async function makePayPalExpressRequest( data ) {
	window.console.log( 'Processing paypal transaction with data', data );
	// This simulates the transaction and provisioning time
	await asyncTimeout( 2000 );
	return window.location.href;
}

const registry = createRegistry();
const { registerStore, select, subscribe } = registry;

export function useIsApplePayAvailable( stripe, stripeConfiguration, items ) {
	const [ canMakePayment, setCanMakePayment ] = useState( 'loading' );

	useEffect( () => {
		let isSubscribed = true;
		// Only calculate this once
		if ( canMakePayment !== 'loading' ) {
			return;
		}

		// We'll need the Stripe library so wait until it is loaded
		if ( ! stripe || ! stripeConfiguration ) {
			return;
		}

		// Our Apple Pay implementation uses the Payment Request API, so
		// check that first.
		if ( ! window.PaymentRequest ) {
			setCanMakePayment( false );
			return;
		}

		// Ask the browser if apple pay can be used. This can be very
		// expensive on certain Safari versions due to a bug
		// (https://trac.webkit.org/changeset/243447/webkit)
		try {
			const browserResponse = !! window.ApplePaySession?.canMakePayments();
			if ( ! browserResponse ) {
				setCanMakePayment( false );
				return;
			}
		} catch ( error ) {
			setCanMakePayment( false );
			return;
		}

		// Ask Stripe if apple pay can be used. This is async.
		const countryCode =
			stripeConfiguration && stripeConfiguration.processor_id === 'stripe_ie' ? 'IE' : 'US';
		const currency = items.reduce(
			( firstCurrency, item ) => firstCurrency || item.amount.currency,
			'usd'
		);
		const paymentRequestOptions = {
			requestPayerName: true,
			requestPayerPhone: false,
			requestPayerEmail: false,
			requestShipping: false,
			country: countryCode,
			currency: currency.toLowerCase(),
			// This is just used here to determine if apple pay is available, not for the actual payment, so we leave this blank
			displayItems: [],
			total: {
				label: 'Total',
				amount: 0,
			},
		};
		const request = stripe.paymentRequest( paymentRequestOptions );
		request.canMakePayment().then( result => {
			isSubscribed && setCanMakePayment( !! result?.applePay );
		} );

		return () => ( isSubscribed = false );
	}, [ canMakePayment, stripe, items, stripeConfiguration ] );

	return { canMakePayment: canMakePayment === true, isLoading: canMakePayment === 'loading' };
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
	const showAdditionalFields = shouldShowAdditionalFields( paymentData );
	const toggleAdditionalFields = () =>
		changePaymentData( 'billing', { ...billing, showAdditionalFields: ! showAdditionalFields } );

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
			<input
				id="show-additional-fields"
				type="checkbox"
				defaultChecked={ showAdditionalFields }
				onChange={ toggleAdditionalFields }
			/>
			<label htmlFor="show-additional-fields">Show additional fields?</label>
			{ showAdditionalFields && <AdditionalFields /> }
		</Form>
	);
}

function shouldShowAdditionalFields( paymentData ) {
	return paymentData.billing && paymentData.billing.showAdditionalFields;
}

function AdditionalFields() {
	const [ paymentData, changePaymentData ] = usePaymentData();
	const { domain = {} } = paymentData;
	const { name = '', address = '' } = domain;
	const onChangeName = event =>
		changePaymentData( 'domain', { ...domain, name: event.target.value } );
	const onChangeAddress = event =>
		changePaymentData( 'domain', { ...domain, address: event.target.value } );
	return (
		<Form>
			<Label htmlFor="name">Name</Label>
			<Input id="name" type="text" value={ name } onChange={ onChangeName } />
			<Label htmlFor="address">Address</Label>
			<Input id="address" type="text" value={ address } onChange={ onChangeAddress } />
		</Form>
	);
}

const orderSummaryStep = getDefaultOrderSummaryStep();
const paymentMethodStep = getDefaultPaymentMethodStep();
const reviewOrderStep = getDefaultOrderReviewStep();

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
		isCompleteCallback: isContactFormComplete,
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

function isContactFormComplete( { paymentData } ) {
	const { billing = {}, domain = {} } = paymentData;
	const allFields = [ billing.country ].concat(
		shouldShowAdditionalFields( paymentData ) ? [ domain.name, domain.address ] : []
	);
	const emptyFields = allFields.filter( value => ! value );
	if ( emptyFields.length > 0 ) {
		return false;
	}
	return true;
}

function HostPage() {
	return (
		<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfiguration }>
			<MyCheckout />
		</StripeHookProvider>
	);
}

function MyCheckout() {
	const [ items, setItems ] = useState( initialItems );
	useEffect( () => {
		subscribe( handleEvent( setItems ) );
	}, [] );
	const total = useMemo( () => getTotal( items ), [ items ] );
	const { stripe, stripeConfiguration, isStripeLoading, stripeLoadingError } = useStripe();
	const {
		canMakePayment: isApplePayAvailable,
		isLoading: isApplePayLoading,
	} = useIsApplePayAvailable( stripe, stripeConfiguration, items );

	const [ isLoading, setIsLoading ] = useState( true );
	useEffect( () => {
		if ( isStripeLoading ) {
			return;
		}
		if ( stripeLoadingError ) {
			setIsLoading( false );
			showErrorMessage( stripeLoadingError );
			return;
		}
		if ( ! stripe || ! stripeConfiguration ) {
			return;
		}
		if ( isApplePayLoading ) {
			return;
		}
		// This simulates an additional loading delay
		setTimeout( () => setIsLoading( false ), 1500 );
	}, [ isStripeLoading, stripeLoadingError, stripe, stripeConfiguration, isApplePayLoading ] );

	const stripeMethod = useMemo( () => {
		if ( isStripeLoading || stripeLoadingError || ! stripe || ! stripeConfiguration ) {
			return null;
		}
		return createStripeMethod( {
			getCountry: () => select( 'checkout' ).getPaymentData().billing.country,
			getPostalCode: () => 90210,
			getSubdivisionCode: () => 'CA',
			registerStore,
			stripe,
			stripeConfiguration,
			submitTransaction: sendStripeTransaction,
		} );
	}, [ stripe, stripeConfiguration, isStripeLoading, stripeLoadingError ] );

	const applePayMethod = useMemo( () => {
		if (
			isStripeLoading ||
			stripeLoadingError ||
			! stripe ||
			! stripeConfiguration ||
			isApplePayLoading ||
			! isApplePayAvailable
		) {
			return null;
		}
		return createApplePayMethod( {
			getCountry: () => select( 'checkout' ).getPaymentData().billing.country,
			getPostalCode: () => 90210,
			registerStore,
			submitTransaction: sendStripeTransaction,
			stripe,
			stripeConfiguration,
		} );
	}, [
		isApplePayLoading,
		stripe,
		stripeConfiguration,
		isStripeLoading,
		stripeLoadingError,
		isApplePayAvailable,
	] );

	const paypalMethod = useMemo(
		() =>
			createPayPalMethod( {
				registerStore,
				submitTransaction: makePayPalExpressRequest,
				getSuccessUrl: () => '#',
				getCancelUrl: () => '#',
			} ),
		[]
	);

	return (
		<CheckoutProvider
			locale={ 'en' }
			items={ items }
			total={ total }
			onEvent={ onEvent }
			onPaymentComplete={ onPaymentComplete }
			showErrorMessage={ showErrorMessage }
			showInfoMessage={ showInfoMessage }
			showSuccessMessage={ showSuccessMessage }
			registry={ registry }
			isLoading={ isLoading }
			paymentMethods={ [ applePayMethod, stripeMethod, paypalMethod ].filter( Boolean ) }
		>
			<Checkout>
				<CheckoutStepBody
					activeStepContent={ orderSummaryStep.activeStepContent }
					completeStepContent={ orderSummaryStep.completeStepContent }
					titleContent={ orderSummaryStep.titleContent }
					errorMessage={ 'There was an error with this step.' }
					isStepActive={ false }
					isStepComplete={ true }
					stepNumber={ 1 }
					totalSteps={ 1 }
					stepId={ 'order-summary' }
				/>
				<CheckoutSteps>
					<CheckoutStep
						stepId="payment-method-step"
						isCompleteCallback={ () =>
							new Promise( resolve => setTimeout( () => resolve( true ), 1500 ) )
						}
						activeStepContent={ paymentMethodStep.activeStepContent }
						completeStepContent={ paymentMethodStep.completeStepContent }
						titleContent={ paymentMethodStep.titleContent }
					/>
					<CheckoutStep
						stepId="review-order-step"
						isCompleteCallback={ () => true }
						activeStepContent={ reviewOrderStep.activeStepContent }
						completeStepContent={ reviewOrderStep.completeStepContent }
						titleContent={ reviewOrderStep.titleContent }
					/>
				</CheckoutSteps>
			</Checkout>
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

// Simulate network request time
async function asyncTimeout( timeout ) {
	return new Promise( resolve => setTimeout( resolve, timeout ) );
}

ReactDOM.render( <HostPage />, document.getElementById( 'root' ) );
