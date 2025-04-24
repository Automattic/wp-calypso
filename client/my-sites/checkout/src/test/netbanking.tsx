/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
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
import { useEffect, useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import {
	createNetBankingMethod,
	createNetBankingPaymentMethodStore,
} from 'calypso/my-sites/checkout/src/payment-methods/netbanking';
import { createReduxStore } from 'calypso/state';

function TestWrapper( { paymentMethods, paymentProcessors = undefined } ) {
	const store = createReduxStore();
	const queryClient = useMemo( () => new QueryClient(), [] );
	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
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
		submitButtonContent: activePayButtonText,
		...additionalArgs,
	} );
}

function ResetNetbankingStoreFields() {
	const { resetFields } = useDispatch( 'netbanking' );
	useEffect( () => {
		resetFields();
	} );
}

describe( 'Netbanking payment method', () => {
	it( 'renders a netbanking option', async () => {
		const paymentMethod = getPaymentMethod();
		render(
			<TestWrapper
				paymentMethods={ [ paymentMethod ] }
				paymentProcessors={ { netbanking: () => makeSuccessResponse( 'ok' ) } }
			></TestWrapper>
		);
		await waitFor( () => {
			expect( screen.queryByText( 'Net Banking' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders submit button when netbanking is selected', async () => {
		const paymentMethod = getPaymentMethod();
		render(
			<TestWrapper
				paymentMethods={ [ paymentMethod ] }
				paymentProcessors={ { netbanking: () => makeSuccessResponse( 'ok' ) } }
			></TestWrapper>
		);
		await waitFor( () => {
			expect( screen.queryByText( activePayButtonText ) ).toBeInTheDocument();
		} );
	} );

	it( 'submits the data to the processor when the submit button is pressed', async () => {
		const user = userEvent.setup();
		const paymentMethod = getPaymentMethod();
		const processorFunction = jest.fn( () => Promise.resolve( makeSuccessResponse( {} ) ) );
		render(
			<TestWrapper
				paymentMethods={ [ paymentMethod ] }
				paymentProcessors={ { netbanking: processorFunction } }
			></TestWrapper>
		);
		await waitFor( () => expect( screen.getByText( activePayButtonText ) ).not.toBeDisabled() );

		await user.type( screen.getByLabelText( /Your name/i ), customerName );
		await user.type( screen.getByLabelText( /GSTIN/i ), gstin );
		await user.type( screen.getAllByLabelText( /PAN Number/i )[ 1 ], pan );
		await user.type( screen.getByLabelText( /Address/i ), customerAddress );
		await user.type( screen.getByLabelText( /Street Number/i ), customerStreet );
		await user.type( screen.getByLabelText( /City/i ), customerCity );
		await user.type( screen.getByLabelText( /State/i ), customerState );
		await user.type( screen.getByLabelText( /Postal code/i ), customerPostalCode );

		await userEvent.click( await screen.findByText( activePayButtonText ) );
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

		// Manually reset the `netbanking` store fields.
		render( <ResetNetbankingStoreFields /> );
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
		await userEvent.click( await screen.findByText( activePayButtonText ) );
		await waitFor( () => {
			expect( processorFunction ).not.toHaveBeenCalled();
		} );
	} );
} );
