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
import { createReduxStore } from 'calypso/state';
import { fetchStripeConfiguration } from './util';

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
const activePayButtonText = 'Pay 0';
function getPaymentMethod( additionalArgs = {} ) {
	const store = createCreditCardPaymentMethodStore( {} );
	return createCreditCardMethod( {
		store,
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

	it.todo( 'submits the data to the processor when the submit button is pressed', async () => {
		const paymentMethod = getPaymentMethod();
		const processorFunction = jest.fn( () => Promise.resolve( makeSuccessResponse( {} ) ) );
		render(
			<TestWrapper
				paymentMethods={ [ paymentMethod ] }
				paymentProcessors={ { card: processorFunction } }
			></TestWrapper>
		);
		await waitFor( () => expect( screen.getByText( activePayButtonText ) ).not.toBeDisabled() );

		fireEvent.change( screen.getAllByLabelText( /Cardholder name/i )[ 0 ], {
			target: { value: customerName },
		} );
		// TODO: fill in remaining fields

		fireEvent.click( await screen.findByText( activePayButtonText ) );
		await waitFor( () => {
			expect( processorFunction ).toHaveBeenCalledWith( {
				name: customerName,
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
