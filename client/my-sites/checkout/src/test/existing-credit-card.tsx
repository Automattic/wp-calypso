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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { createExistingCardMethod } from 'calypso/my-sites/checkout/src/payment-methods/existing-credit-card';
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

const cardholderName = 'Human Person';
const activePayButtonText = 'Payment Activate';
const storedDetailsId = '12345';
const paymentMethodToken = '123ab';
const paymentPartnerProcessorId = 'test-proccessor';
function getExistingCardPaymentMethod( additionalArgs = {} ) {
	return createExistingCardMethod( {
		id: 'test-card',
		cardholderName,
		cardExpiry: '2099-10-31',
		brand: 'visa',
		last4: '1234',
		storedDetailsId,
		paymentMethodToken,
		paymentPartnerProcessorId,
		submitButtonContent: activePayButtonText,
		...additionalArgs,
	} );
}

function mockTaxLocationEndpoint( { isSet = false } = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/me/payment-methods/${ storedDetailsId }/tax-location` )
		.reply( 200, () =>
			isSet
				? {
						is_tax_info_set: true,
						tax_country_code: 'US',
						tax_postal_code: '10001',
				  }
				: {
						is_tax_info_set: false,
						tax_country_code: '',
						tax_postal_code: '',
				  }
		);
}

describe( 'Existing credit card payment methods', () => {
	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'renders an existing card option for a stored card', async () => {
		mockTaxLocationEndpoint();
		const existingCard = getExistingCardPaymentMethod();
		render(
			<TestWrapper
				paymentMethods={ [ existingCard ] }
				paymentProcessors={ {
					[ existingCard.paymentProcessorId ]: () => makeSuccessResponse( 'ok' ),
				} }
			></TestWrapper>
		);
		await waitFor( () => {
			expect( screen.queryByText( cardholderName ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders an existing card button when an existing card is selected', async () => {
		mockTaxLocationEndpoint();
		const existingCard = getExistingCardPaymentMethod();
		render(
			<TestWrapper
				paymentMethods={ [ existingCard ] }
				paymentProcessors={ {
					[ existingCard.paymentProcessorId ]: () => makeSuccessResponse( 'ok' ),
				} }
			></TestWrapper>
		);
		await waitFor( () => {
			expect( screen.queryByText( activePayButtonText ) ).toBeInTheDocument();
		} );
	} );

	it( 'submits the existing card data to the processor when the submit button is pressed if tax location is not required', async () => {
		mockTaxLocationEndpoint();
		const existingCard = getExistingCardPaymentMethod();
		const existingCardProcessor = jest.fn( () => Promise.resolve( makeSuccessResponse( {} ) ) );
		render(
			<TestWrapper
				paymentMethods={ [ existingCard ] }
				paymentProcessors={ { 'existing-card': existingCardProcessor } }
			></TestWrapper>
		);
		await waitFor( () => expect( screen.getByText( activePayButtonText ) ).not.toBeDisabled() );
		await userEvent.click( await screen.findByText( activePayButtonText ) );
		await waitFor( () => {
			expect( existingCardProcessor ).toHaveBeenCalledWith( {
				name: cardholderName,
				storedDetailsId,
				paymentMethodToken,
				paymentPartnerProcessorId,
			} );
		} );
	} );

	it( 'submits the existing card data to the processor when the submit button is pressed if tax location is required and set', async () => {
		mockTaxLocationEndpoint( { isSet: true } );
		const existingCardProcessor = jest.fn( () => Promise.resolve( makeSuccessResponse( {} ) ) );
		const existingCard = getExistingCardPaymentMethod( {
			isTaxInfoRequired: true,
		} );
		render(
			<TestWrapper
				paymentMethods={ [ existingCard ] }
				paymentProcessors={ { 'existing-card': existingCardProcessor } }
			></TestWrapper>
		);
		await waitFor( () => expect( screen.getByText( activePayButtonText ) ).not.toBeDisabled() );
		await userEvent.click( await screen.findByText( activePayButtonText ) );
		await waitFor( () => {
			expect( existingCardProcessor ).toHaveBeenCalledWith( {
				name: cardholderName,
				storedDetailsId,
				paymentMethodToken,
				paymentPartnerProcessorId,
			} );
		} );
	} );

	it( 'does not submit the existing card data to the processor when the submit button is pressed if tax location is required and not set', async () => {
		mockTaxLocationEndpoint( { isSet: false } );
		const existingCardProcessor = jest.fn( () => Promise.resolve( makeSuccessResponse( {} ) ) );
		const existingCard = getExistingCardPaymentMethod( {
			isTaxInfoRequired: true,
		} );
		render(
			<TestWrapper
				paymentMethods={ [ existingCard ] }
				paymentProcessors={ { 'existing-card': existingCardProcessor } }
			></TestWrapper>
		);
		await waitFor( () => expect( screen.getByText( activePayButtonText ) ).not.toBeDisabled() );
		await userEvent.click( await screen.findByText( activePayButtonText ) );
		await waitFor( () => {
			expect( existingCardProcessor ).not.toHaveBeenCalled();
		} );
	} );
} );
