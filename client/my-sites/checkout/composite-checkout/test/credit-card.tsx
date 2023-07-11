/**
 * @jest-environment jsdom
 */
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
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import {
	createCreditCardPaymentMethodStore,
	createCreditCardMethod,
} from 'calypso/my-sites/checkout/composite-checkout/payment-methods/credit-card';
import { actions } from 'calypso/my-sites/checkout/composite-checkout/payment-methods/credit-card/store';
import { createReduxStore } from 'calypso/state';
import { fetchStripeConfiguration, stripeConfiguration } from './util';
import type { CardStoreType } from 'calypso/my-sites/checkout/composite-checkout/payment-methods/credit-card/types';

function TestWrapper( { paymentMethods, paymentProcessors = undefined } ) {
	const store = createReduxStore();
	const queryClient = new QueryClient();
	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfiguration }>
					<CheckoutProvider
						paymentMethods={ paymentMethods }
						selectFirstAvailablePaymentMethod
						paymentProcessors={ paymentProcessors ?? {} }
					>
						<CheckoutStepGroup>
							<PaymentMethodStep />
							<CheckoutFormSubmit />
						</CheckoutStepGroup>
					</CheckoutProvider>
				</StripeHookProvider>
			</QueryClientProvider>
		</ReduxProvider>
	);
}

const customerName = 'Human Person';
const cardNumber = '4242424242424242';
const cardExpiry = '05/99';
const cardCvv = '123';
const activePayButtonText = 'Complete Checkout';
function getPaymentMethod( store: CardStoreType, additionalArgs = {} ) {
	return createCreditCardMethod( {
		store,
		...additionalArgs,
	} );
}

function ResetCreditCardStoreFields() {
	const { resetFields } = useDispatch( 'wpcom-credit-card' );
	useEffect( () => {
		resetFields();
	} );
}

describe( 'Credit card payment method', () => {
	it( 'renders a credit card option', async () => {
		const store = createCreditCardPaymentMethodStore( {} );
		const paymentMethod = getPaymentMethod( store );
		render( <TestWrapper paymentMethods={ [ paymentMethod ] }></TestWrapper> );
		await waitFor( () => {
			expect( screen.queryByText( 'Credit or debit card' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders submit button when credit card is selected', async () => {
		const store = createCreditCardPaymentMethodStore( {} );
		const paymentMethod = getPaymentMethod( store );
		render( <TestWrapper paymentMethods={ [ paymentMethod ] }></TestWrapper> );
		await waitFor( () => {
			expect( screen.queryByText( activePayButtonText ) ).toBeInTheDocument();
		} );
	} );

	it( 'submits the data to the processor when the submit button is pressed', async () => {
		const user = userEvent.setup();
		const store = createCreditCardPaymentMethodStore( {} );
		const paymentMethod = getPaymentMethod( store );
		const processorFunction = jest.fn( () => Promise.resolve( makeSuccessResponse( {} ) ) );
		render(
			<TestWrapper
				paymentMethods={ [ paymentMethod ] }
				paymentProcessors={ { card: processorFunction } }
			></TestWrapper>
		);
		await waitFor( () => expect( screen.getByText( activePayButtonText ) ).not.toBeDisabled() );

		await user.type( screen.getAllByLabelText( /Cardholder name/i )[ 1 ], customerName );
		await user.type( screen.getByLabelText( /Card number/i ), cardNumber );
		await user.type( screen.getByLabelText( /Expiry date/i ), cardExpiry );
		await user.type( screen.getAllByLabelText( /Security code/i )[ 0 ], cardCvv );

		// Stripe fields will not actually operate in this test so we have to pretend they are complete.
		store.dispatch( actions.setCardDataComplete( 'cardNumber', true ) );
		store.dispatch( actions.setCardDataComplete( 'cardExpiry', true ) );
		store.dispatch( actions.setCardDataComplete( 'cardCvc', true ) );

		await user.click( await screen.findByText( activePayButtonText ) );
		await waitFor( () => {
			expect( processorFunction ).toHaveBeenCalledWith( {
				name: customerName,
				eventSource: 'checkout',
				paymentPartner: 'stripe',
				countryCode: '',
				postalCode: '',
				stripe: null,
				cardNumberElement: undefined,
				stripeConfiguration,
				useForAllSubscriptions: false,
			} );
		} );

		// Manually reset the `wpcom-credit-card` store fields.
		render( <ResetCreditCardStoreFields /> );
	} );

	it( 'does not submit the data to the processor when the submit button is pressed if fields are missing', async () => {
		const store = createCreditCardPaymentMethodStore( {} );
		const paymentMethod = getPaymentMethod( store );
		const processorFunction = jest.fn( () => Promise.resolve( makeSuccessResponse( {} ) ) );
		render(
			<TestWrapper
				paymentMethods={ [ paymentMethod ] }
				paymentProcessors={ { card: processorFunction } }
			></TestWrapper>
		);
		await waitFor( () => expect( screen.getByText( activePayButtonText ) ).not.toBeDisabled() );
		await userEvent.click( await screen.findByText( activePayButtonText ) );
		await waitFor( () => {
			expect( processorFunction ).not.toHaveBeenCalled();
		} );
	} );
} );
