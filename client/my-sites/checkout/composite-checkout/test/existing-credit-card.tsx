/**
 * @jest-environment jsdom
 */
import {
	CheckoutProvider,
	Checkout,
	CheckoutStepArea,
	getDefaultPaymentMethodStep,
	CheckoutStep,
} from '@automattic/composite-checkout';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { createExistingCardMethod } from 'calypso/my-sites/checkout/composite-checkout/payment-methods/existing-credit-card';
import { createReduxStore } from 'calypso/state';

function TestWrapper( { paymentMethods } ) {
	const store = createReduxStore();
	const queryClient = new QueryClient();
	const paymentMethodStepProps = getDefaultPaymentMethodStep();
	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<CheckoutProvider
					paymentMethods={ paymentMethods }
					initiallySelectedPaymentMethodId={ paymentMethods[ 0 ].id }
					paymentProcessors={ {} }
				>
					<Checkout>
						<CheckoutStepArea>
							<CheckoutStep { ...paymentMethodStepProps } />
						</CheckoutStepArea>
					</Checkout>
				</CheckoutProvider>
			</QueryClientProvider>
		</ReduxProvider>
	);
}

const cardholderName = 'Human Person';
const activePayButtonText = 'Payment Activate';
const storedDetailsId = '12345';
const existingCard = createExistingCardMethod( {
	id: 'test-card',
	cardholderName,
	cardExpiry: '2099-10-31',
	brand: 'visa',
	last4: '1234',
	storedDetailsId,
	paymentMethodToken: '1234a',
	paymentPartnerProcessorId: 'test-proccessor',
	activePayButtonText,
} );

function mockTaxLocationEndpoint() {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/me/payment-methods/${ storedDetailsId }/tax-location` )
		.reply( 200, () => ( {
			is_tax_info_set: true,
			tax_country_code: 'US',
			tax_postal_code: '10001',
		} ) );
}

describe( 'Existing credit card payment methods', () => {
	it( 'renders an existing card option for a stored card', async () => {
		mockTaxLocationEndpoint();
		render( <TestWrapper paymentMethods={ [ existingCard ] }></TestWrapper> );
		await waitFor( () => {
			expect( screen.queryByText( cardholderName ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders an existing card button when an existing card is selected', async () => {
		mockTaxLocationEndpoint();
		render( <TestWrapper paymentMethods={ [ existingCard ] }></TestWrapper> );
		await waitFor( () => {
			expect( screen.queryByText( activePayButtonText ) ).toBeInTheDocument();
		} );
	} );

	it.todo( 'submits the existing card data to the processor when the submit button is pressed' );
} );
