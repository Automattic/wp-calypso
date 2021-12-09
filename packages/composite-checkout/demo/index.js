/* eslint-disable import/no-extraneous-dependencies */
import {
	Checkout,
	CheckoutStepArea,
	CheckoutStep,
	CheckoutStepBody,
	CheckoutSteps,
	CheckoutSummaryArea,
	CheckoutProvider,
	FormStatus,
	getDefaultOrderSummary,
	getDefaultOrderReviewStep,
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	useIsStepActive,
	useFormStatus,
	makeSuccessResponse,
} from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useState, useEffect, useMemo } from 'react';
import { createPayPalMethod } from './pay-pal';

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
	window.alert( 'Your payment is complete!' );
};

async function payPalProcessor( data ) {
	window.console.log( 'Processing PayPal transaction with data', data );
	// This simulates the transaction and provisioning time
	await asyncTimeout( 2000 );
	return makeSuccessResponse( { success: true } );
}

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

const contactFormData = {
	country: '',
};

function setCountry( value ) {
	contactFormData.country = value;
}

function getCountry() {
	return contactFormData.country;
}

function ContactForm( { summary } ) {
	const country = getCountry();
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

export function CheckoutDemo() {
	const [ items ] = useState( initialItems );
	const total = useMemo( () => getTotal( items ), [ items ] );

	const [ isLoading, setIsLoading ] = useState( true );
	useEffect( () => {
		// This simulates an additional loading delay
		setTimeout( () => setIsLoading( false ), 1500 );
	}, [] );

	const payPalMethod = useMemo( () => {
		return createPayPalMethod();
	}, [] );

	return (
		<CheckoutProvider
			items={ items }
			total={ total }
			onPaymentComplete={ onPaymentComplete }
			isLoading={ isLoading }
			paymentMethods={ [ payPalMethod ] }
			paymentProcessors={ { paypal: payPalProcessor } }
			initiallySelectedPaymentMethodId={ payPalMethod }
		>
			<MyCheckoutBody />
		</CheckoutProvider>
	);
}

function MyCheckoutBody() {
	const country = getCountry();

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

export default {
	title: 'composite-checkout',
	component: CheckoutDemo,
};
