// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';

/**
 * External dependencies
 */
import React, { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import ReactDOM from 'react-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
	Checkout,
	CheckoutStepArea,
	CheckoutStep,
	CheckoutStepBody,
	CheckoutSteps,
	CheckoutSummaryArea,
	CheckoutProvider,
	createPayPalMethod,
	createStripeMethod,
	createStripePaymentMethodStore,
	defaultRegistry,
	FormStatus,
	getDefaultOrderSummary,
	getDefaultOrderReviewStep,
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	useIsStepActive,
	useSelect,
	useDispatch,
	useMessages,
	useFormStatus,
	makeSuccessResponse,
} from '@automattic/composite-checkout';
import { StripeHookProvider, useStripe } from '../src/lib/stripe-demo';

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
		sublabel: 'example.com',
		id: 'wpcom-domain',
		type: 'domain',
		amount: { currency: 'USD', value: 0, displayValue: '$0' },
	},
];

const onPaymentComplete = () => {
	const successRedirectUrl = '/complete.html';
	window.location.href = successRedirectUrl;
};
const onEvent = ( event ) => window.console.log( 'Event', event );
const showErrorMessage = ( error ) => {
	console.log( 'Error:', error ); /* eslint-disable-line no-console */
	window.alert( 'There was a problem with your payment: ' + error );
};
const showInfoMessage = ( message ) => {
	console.log( 'Info:', message ); /* eslint-disable-line no-console */
	window.alert( message );
};
const showSuccessMessage = ( message ) => {
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

async function stripeCardProcessor( data ) {
	window.console.log( 'Processing stripe transaction with data', data );
	// This simulates the transaction and provisioning time
	await asyncTimeout( 2000 );
	return makeSuccessResponse( { success: true } );
}

async function makePayPalExpressRequest( data ) {
	window.console.log( 'Processing paypal transaction with data', data );
	// This simulates the transaction and provisioning time
	await asyncTimeout( 2000 );
	return window.location.href;
}

const { registerStore } = defaultRegistry;

registerStore( 'demo', {
	actions: {
		setCountry( payload ) {
			return { type: 'set_country', payload };
		},
	},
	selectors: {
		getCountry( state ) {
			return state.country;
		},
	},
	reducer( state = {}, action ) {
		if ( action.type === 'set_country' ) {
			return { ...state, country: action.payload };
		}
		return state;
	},
} );

const getTotal = ( items ) => {
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

const ContactFormTitle = () => {
	const isActive = useIsStepActive();
	return isActive ? 'Enter your contact details' : 'Contact details';
};

const Label = styled.label`
	display: block;
	color: ${ ( props ) => props.theme.colors.textColor };
	font-weight: ${ ( props ) => props.theme.weights.bold };
	font-size: 14px;
	margin-bottom: 8px;

	:hover {
		cursor: ${ ( props ) => ( props.disabled ? 'default' : 'pointer' ) };
	}
`;

const Input = styled.input`
	display: block;
	width: 100%;
	box-sizing: border-box;
	font-size: 16px;
	border: 1px solid
		${ ( props ) => ( props.isError ? props.theme.colors.error : props.theme.colors.borderColor ) };
	padding: 13px 10px 12px 10px;

	:focus {
		outline: ${ ( props ) =>
				props.isError ? props.theme.colors.error : props.theme.colors.outline }
			solid 2px !important;
	}
`;

const Form = styled.div`
	margin-bottom: 0.5em;
`;

function ContactForm( { summary } ) {
	const country = useSelect( ( storeSelect ) => storeSelect( 'demo' )?.getCountry() ?? '' );
	const { setCountry } = useDispatch( 'demo' );
	const onChangeCountry = ( event ) => setCountry( event.target.value );
	const { formStatus } = useFormStatus();

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
			<Input
				id="country"
				type="text"
				value={ country }
				onChange={ onChangeCountry }
				disabled={ formStatus !== FormStatus.READY }
			/>
		</Form>
	);
}

const orderSummary = getDefaultOrderSummary();
const orderSummaryStep = getDefaultOrderSummaryStep();
const paymentMethodStep = getDefaultPaymentMethodStep();
const reviewOrderStep = getDefaultOrderReviewStep();
const contactFormStep = {
	id: 'contact-form',
	className: 'checkout__billing-details-step',
	titleContent: <ContactFormTitle />,
	activeStepContent: <ContactForm />,
	completeStepContent: <ContactForm summary />,
};

function HostPage() {
	return (
		<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfiguration }>
			<MyCheckout />
		</StripeHookProvider>
	);
}

function MyCheckout() {
	const [ items ] = useState( initialItems );
	const total = useMemo( () => getTotal( items ), [ items ] );
	const { stripe, stripeConfiguration, isStripeLoading, stripeLoadingError } = useStripe();

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
		// This simulates an additional loading delay
		setTimeout( () => setIsLoading( false ), 1500 );
	}, [ isStripeLoading, stripeLoadingError, stripe, stripeConfiguration ] );

	const stripeStore = useMemo( () => createStripePaymentMethodStore(), [] );

	const stripeMethod = useMemo( () => {
		if ( isStripeLoading || stripeLoadingError || ! stripe || ! stripeConfiguration ) {
			return null;
		}
		return createStripeMethod( {
			store: stripeStore,
			stripe,
			stripeConfiguration,
		} );
	}, [ stripeStore, stripe, stripeConfiguration, isStripeLoading, stripeLoadingError ] );

	const paypalMethod = useMemo(
		() =>
			createPayPalMethod( {
				registerStore,
				getSuccessUrl: () => '#',
				getCancelUrl: () => '#',
			} ),
		[]
	);
	paypalMethod.submitTransaction = makePayPalExpressRequest;

	const paymentMethods = [ stripeMethod, paypalMethod ].filter( Boolean );

	return (
		<CheckoutProvider
			items={ items }
			total={ total }
			onEvent={ onEvent }
			onPaymentComplete={ onPaymentComplete }
			showErrorMessage={ showErrorMessage }
			showInfoMessage={ showInfoMessage }
			showSuccessMessage={ showSuccessMessage }
			registry={ defaultRegistry }
			isLoading={ isLoading }
			paymentMethods={ paymentMethods }
			paymentProcessors={ { card: stripeCardProcessor } }
			initiallySelectedPaymentMethodId={ paymentMethods[ 0 ]?.id }
		>
			<MyCheckoutBody />
		</CheckoutProvider>
	);
}

function MyCheckoutBody() {
	const country = useSelect( ( storeSelect ) => storeSelect( 'demo' )?.getCountry() ?? '' );
	const { showErrorMessage: showError } = useMessages();

	return (
		<Checkout>
			<CheckoutSummaryArea className={ orderSummary.className }>
				{ orderSummary.summaryContent }
			</CheckoutSummaryArea>
			<CheckoutStepArea>
				<CheckoutStepBody
					activeStepContent={ orderSummaryStep.activeStepContent }
					completeStepContent={ orderSummaryStep.completeStepContent }
					titleContent={ orderSummaryStep.titleContent }
					isStepActive={ false }
					isStepComplete={ true }
					stepNumber={ 1 }
					stepId={ 'order-summary' }
				/>
				<CheckoutSteps>
					<CheckoutStep
						stepId="review-order-step"
						isCompleteCallback={ () => true }
						activeStepContent={ reviewOrderStep.activeStepContent }
						completeStepContent={ reviewOrderStep.completeStepContent }
						titleContent={ reviewOrderStep.titleContent }
					/>
					<CheckoutStep
						stepId={ contactFormStep.id }
						isCompleteCallback={ () =>
							new Promise( ( resolve ) =>
								setTimeout( () => {
									if ( country.length === 0 ) {
										showError( 'The country field is required' );
										resolve( false );
										return;
									}
									resolve( true );
								}, 1500 )
							)
						}
						activeStepContent={ contactFormStep.activeStepContent }
						completeStepContent={ contactFormStep.completeStepContent }
						titleContent={ contactFormStep.titleContent }
					/>
					<CheckoutStep
						stepId="payment-method-step"
						activeStepContent={ paymentMethodStep.activeStepContent }
						completeStepContent={ paymentMethodStep.completeStepContent }
						titleContent={ paymentMethodStep.titleContent }
					/>
				</CheckoutSteps>
			</CheckoutStepArea>
		</Checkout>
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
	return new Promise( ( resolve ) => setTimeout( resolve, timeout ) );
}

ReactDOM.render( <HostPage />, document.getElementById( 'root' ) );
