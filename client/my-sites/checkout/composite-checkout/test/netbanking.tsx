/**
 * @jest-environment jsdom
 */
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
	createNetBankingMethod,
	createNetBankingPaymentMethodStore,
} from 'calypso/my-sites/checkout/composite-checkout/payment-methods/netbanking';
import { createReduxStore } from 'calypso/state';

function TestWrapper( { paymentMethods, paymentProcessors = undefined } ) {
	const store = createReduxStore();
	const queryClient = new QueryClient();
	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
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
			</QueryClientProvider>
		</ReduxProvider>
	);
}

const customerName = 'Human Person';
const pan = 'ABCDE1234F';
const gstin = '22AAAAA0000A1Z5';
const customerPostalCode = '1234';
const customerAddress = 'Main Street';
const customerStreet = '1100';
const customerCity = 'Somewhere';
const customerState = 'Elsewhere';
const activePayButtonText = 'Pay 0';
function getPaymentMethod( additionalArgs = {} ) {
	const store = createNetBankingPaymentMethodStore();
	return createNetBankingMethod( {
		store,
		...additionalArgs,
	} );
}

describe( 'Netbanking payment method', () => {
	it( 'renders a netbanking option', async () => {
		const paymentMethod = getPaymentMethod();
		render( <TestWrapper paymentMethods={ [ paymentMethod ] }></TestWrapper> );
		await waitFor( () => {
			expect( screen.queryByText( 'Net Banking' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders submit button when netbanking is selected', async () => {
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
				paymentProcessors={ { netbanking: processorFunction } }
			></TestWrapper>
		);
		await waitFor( () => expect( screen.getByText( activePayButtonText ) ).not.toBeDisabled() );

		fireEvent.change( screen.getByLabelText( /Your name/i ), {
			target: { value: customerName },
		} );
		fireEvent.change( screen.getByLabelText( /GSTIN/i ), {
			target: { value: gstin },
		} );
		fireEvent.change( screen.getAllByLabelText( /PAN Number/i )[ 1 ], {
			target: { value: pan },
		} );
		fireEvent.change( screen.getByLabelText( /Address/i ), {
			target: { value: customerAddress },
		} );
		fireEvent.change( screen.getByLabelText( /Street Number/i ), {
			target: { value: customerStreet },
		} );
		fireEvent.change( screen.getByLabelText( /City/i ), {
			target: { value: customerCity },
		} );
		fireEvent.change( screen.getByLabelText( /State/i ), {
			target: { value: customerState },
		} );
		fireEvent.change( screen.getByLabelText( /Postal code/i ), {
			target: { value: customerPostalCode },
		} );

		fireEvent.click( await screen.findByText( activePayButtonText ) );
		await waitFor( () => {
			expect( processorFunction ).toHaveBeenCalledWith( {
				name: customerName,
				address: customerAddress,
				address1: customerAddress,
				streetNumber: customerStreet,
				city: customerCity,
				state: customerState,
				postalCode: customerPostalCode,
				pan,
				gstin,
			} );
		} );
	} );

	it( 'does not submit the data to the processor when the submit button is pressed if fields are missing', async () => {
		const paymentMethod = getPaymentMethod();
		const processorFunction = jest.fn( () => Promise.resolve( makeSuccessResponse( {} ) ) );
		render(
			<TestWrapper
				paymentMethods={ [ paymentMethod ] }
				paymentProcessors={ { netbanking: processorFunction } }
			></TestWrapper>
		);
		await waitFor( () => expect( screen.getByText( activePayButtonText ) ).not.toBeDisabled() );
		fireEvent.click( await screen.findByText( activePayButtonText ) );
		await waitFor( () => {
			expect( processorFunction ).not.toHaveBeenCalled();
		} );
	} );
} );
