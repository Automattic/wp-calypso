/**
 * @jest-environment jsdom
 */
import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import {
	CheckoutProvider,
	CheckoutStepGroup,
	PaymentMethodStep,
	makeSuccessResponse,
	CheckoutFormSubmit,
} from '@automattic/composite-checkout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistryProvider, createRegistry, useDispatch, useRegistry } from '@wordpress/data';
import { useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import GlobalNotices from 'calypso/components/global-notices';
import {
	createCreditCardPaymentMethodStore,
	createCreditCardMethod,
} from 'calypso/my-sites/checkout/src/payment-methods/credit-card';
import {
	createTestReduxStore,
	fetchRazorpayConfiguration,
	fetchStripeConfiguration,
	stripeConfiguration,
} from './util';
import type { CardStoreType } from 'calypso/my-sites/checkout/src/payment-methods/credit-card/types';

jest.mock( '@stripe/react-stripe-js', () => {
	const mockUseElements = () => ( {
		getElement: () => {
			// The credit card payment method submit button requires passing
			// the cardNumberElement to the payment processor. If the element
			// cannot be found, it displays an error to the user. In order to
			// test that the payment processor is called, we must mock the
			// element, but mocking the whole field itself is quite difficult,
			// so instead here we just mock the `useElements()` function which
			// the submit button (`CreditCardPayButton`) uses to find the field
			// and return a mock object.
			return {};
		},
	} );

	const stripe = jest.requireActual( '@stripe/react-stripe-js' );
	return { ...stripe, useElements: mockUseElements };
} );

function TestWrapper( { paymentProcessors = undefined } ) {
	const [ store ] = useState( () => createTestReduxStore() );
	const [ queryClient ] = useState( () => new QueryClient() );
	const [ testRegistry ] = useState( () => createRegistry( {} ) );

	return (
		<RegistryProvider value={ testRegistry }>
			<ReduxProvider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<TestWrapperInner paymentProcessors={ paymentProcessors } />
				</QueryClientProvider>
			</ReduxProvider>
		</RegistryProvider>
	);
}

function TestWrapperInner( { paymentProcessors = undefined } ) {
	const creditCardStore = useCreateCreditCardStore();
	const paymentMethod = useCreateCreditCardMethod( creditCardStore );
	return (
		<>
			<GlobalNotices />
			<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfiguration }>
				<RazorpayHookProvider fetchRazorpayConfiguration={ fetchRazorpayConfiguration }>
					<CheckoutProvider
						paymentMethods={ [ paymentMethod ] }
						selectFirstAvailablePaymentMethod
						paymentProcessors={ paymentProcessors ?? {} }
					>
						<CheckoutStepGroup>
							<CompleteCreditCardFields />
							<PaymentMethodStep />
							<CheckoutFormSubmit />
						</CheckoutStepGroup>
					</CheckoutProvider>
				</RazorpayHookProvider>
			</StripeHookProvider>
		</>
	);
}

const customerName = 'Human Person';
const cardNumber = '4242424242424242';
const cardExpiry = '05/99';
const cardCvv = '123';
const activePayButtonText = 'Complete Checkout';
function useCreateCreditCardMethod( store: CardStoreType, additionalArgs = {} ) {
	const [ method ] = useState( () =>
		createCreditCardMethod( {
			store,
			submitButtonContent: activePayButtonText,
			...additionalArgs,
		} )
	);
	return method;
}

function useCreateCreditCardStore() {
	// NOTE: the return type of useRegistry is `Function` which is incorrect
	// and causes a type error here, but it does actually return a registry.
	const registry = useRegistry();
	const [ store ] = useState( () => createCreditCardPaymentMethodStore( { registry } ) );
	return store;
}

function CompleteCreditCardFields() {
	const { setCardDataComplete } = useDispatch( 'wpcom-credit-card' );
	const completeFields = () => {
		// Stripe fields will not actually operate in this test so we have to pretend they are complete.
		setCardDataComplete( 'cardNumber', true );
		setCardDataComplete( 'cardExpiry', true );
		setCardDataComplete( 'cardCvc', true );
	};
	return <button onClick={ completeFields }>Mark credit fields as complete</button>;
}

describe( 'Credit card payment method', () => {
	it( 'renders a credit card option', async () => {
		render( <TestWrapper paymentProcessors={ { card: () => makeSuccessResponse( 'ok' ) } } /> );
		await waitFor( () => {
			expect( screen.queryByText( 'Credit or debit card' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders submit button when credit card is selected', async () => {
		render( <TestWrapper paymentProcessors={ { card: () => makeSuccessResponse( 'ok' ) } } /> );
		await waitFor( () => {
			expect( screen.queryByText( activePayButtonText ) ).toBeInTheDocument();
		} );
	} );

	it( 'submits the data to the processor when the submit button is pressed', async () => {
		const user = userEvent.setup();
		const processorFunction = jest.fn( () => Promise.resolve( makeSuccessResponse( {} ) ) );
		render( <TestWrapper paymentProcessors={ { card: processorFunction } }></TestWrapper> );
		await waitFor( () => expect( screen.getByText( activePayButtonText ) ).not.toBeDisabled() );

		await user.type( screen.getAllByLabelText( /Cardholder name/i )[ 1 ], customerName );
		await user.type( screen.getByLabelText( /Card number/i ), cardNumber );
		await user.type( screen.getByLabelText( /Expiry date/i ), cardExpiry );
		await user.type( screen.getAllByLabelText( /Security code/i )[ 0 ], cardCvv );

		await user.click( await screen.findByText( 'Mark credit fields as complete' ) );

		await user.click( await screen.findByText( activePayButtonText ) );
		await waitFor( () => {
			expect( processorFunction ).toHaveBeenCalledWith( {
				name: customerName,
				eventSource: 'checkout',
				paymentPartner: 'stripe',
				countryCode: '',
				postalCode: '',
				stripe: null,
				cardNumberElement: {},
				stripeConfiguration,
				useForAllSubscriptions: false,
			} );
		} );
	} );

	it( 'does not submit the data to the processor when the submit button is pressed if fields are missing', async () => {
		const processorFunction = jest.fn( () => Promise.resolve( makeSuccessResponse( {} ) ) );
		render( <TestWrapper paymentProcessors={ { card: processorFunction } }></TestWrapper> );
		await waitFor( () => expect( screen.getByText( activePayButtonText ) ).not.toBeDisabled() );
		await userEvent.click( await screen.findByText( activePayButtonText ) );
		await waitFor( () => {
			expect( processorFunction ).not.toHaveBeenCalled();
		} );
	} );

	it( 'displays error message overlay when a credit card field is empty and submit is clicked', async () => {
		const user = userEvent.setup();
		const processorFunction = jest.fn( () => Promise.resolve( makeSuccessResponse( {} ) ) );
		render( <TestWrapper paymentProcessors={ { card: processorFunction } }></TestWrapper> );

		await waitFor( () => expect( screen.getByText( activePayButtonText ) ).not.toBeDisabled() );

		// Partially fill the form, leaving security code field empty
		await user.type( screen.getAllByLabelText( /Cardholder name/i )[ 1 ], customerName );
		await user.type( screen.getByLabelText( /Card number/i ), cardNumber );
		await user.type( screen.getByLabelText( /Expiry date/i ), cardExpiry );

		// Try to submit the form
		await user.click( await screen.findByText( activePayButtonText ) );

		// Verify the error message overlay appears
		const element = await screen.findByText( /Something seems to be missing/i );
		expect( element ).not.toBeFalsy();
	} );
} );
