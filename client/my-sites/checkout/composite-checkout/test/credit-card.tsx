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
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import {
	createCreditCardPaymentMethodStore,
	createCreditCardMethod,
} from 'calypso/my-sites/checkout/composite-checkout/payment-methods/credit-card';
import { actions } from 'calypso/my-sites/checkout/composite-checkout/payment-methods/credit-card/store';
import { createReduxStore } from 'calypso/state';
import { fetchStripeConfiguration, stripeConfiguration } from './util';

function TestWrapper( { paymentMethods, paymentProcessors = undefined } ) {
	const store = createReduxStore();
	const queryClient = new QueryClient();
	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfiguration }>
					<CheckoutProvider
						paymentMethods={ paymentMethods }
						initiallySelectedPaymentMethodId={ paymentMethods[ 0 ].id }
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
const activePayButtonText = 'Pay 0';
const paymentMethodStore = createCreditCardPaymentMethodStore( {} );
function getPaymentMethod( additionalArgs = {} ) {
	return createCreditCardMethod( {
		store: paymentMethodStore,
		...additionalArgs,
	} );
}

describe( 'Credit card payment method', () => {
	it( 'renders a credit card option', async () => {
		const paymentMethod = getPaymentMethod();
		render( <TestWrapper paymentMethods={ [ paymentMethod ] }></TestWrapper> );
		await waitFor( () => {
			expect( screen.queryByText( 'Credit or debit card' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders submit button when credit card is selected', async () => {
		const paymentMethod = getPaymentMethod();
		render( <TestWrapper paymentMethods={ [ paymentMethod ] }></TestWrapper> );
		await waitFor( () => {
			expect( screen.queryByText( activePayButtonText ) ).toBeInTheDocument();
		} );
	} );

	it( 'submits the data to the processor when the submit button is pressed', async () => {
		const paymentMethod = getPaymentMethod();
		const processorFunction = jest.fn( () => Promise.resolve( makeSuccessResponse( {} ) ) );
		render(
			<TestWrapper
				paymentMethods={ [ paymentMethod ] }
				paymentProcessors={ { card: processorFunction } }
			></TestWrapper>
		);
		await waitFor( () => expect( screen.getByText( activePayButtonText ) ).not.toBeDisabled() );

		fireEvent.change( screen.getAllByLabelText( /Cardholder name/i )[ 1 ], {
			target: { value: customerName },
		} );
		fireEvent.change( screen.getByLabelText( /Card number/i ), {
			target: { value: cardNumber },
		} );
		fireEvent.change( screen.getByLabelText( /Expiry date/i ), {
			target: { value: cardExpiry },
		} );
		fireEvent.change( screen.getAllByLabelText( /Security code/i )[ 0 ], {
			target: { value: cardCvv },
		} );

		// Stripe fields will not actually operate in this test so we have to pretend they are complete.
		paymentMethodStore.dispatch( actions.setCardDataComplete( 'cardNumber', true ) );
		paymentMethodStore.dispatch( actions.setCardDataComplete( 'cardExpiry', true ) );
		paymentMethodStore.dispatch( actions.setCardDataComplete( 'cardCvc', true ) );

		fireEvent.click( await screen.findByText( activePayButtonText ) );
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
	} );

	it( 'does not submit the data to the processor when the submit button is pressed if fields are missing', async () => {
		const paymentMethod = getPaymentMethod();
		const processorFunction = jest.fn( () => Promise.resolve( makeSuccessResponse( {} ) ) );
		render(
			<TestWrapper
				paymentMethods={ [ paymentMethod ] }
				paymentProcessors={ { card: processorFunction } }
			></TestWrapper>
		);
		await waitFor( () => expect( screen.getByText( activePayButtonText ) ).not.toBeDisabled() );
		fireEvent.click( await screen.findByText( activePayButtonText ) );
		await waitFor( () => {
			expect( processorFunction ).not.toHaveBeenCalled();
		} );
	} );
} );
