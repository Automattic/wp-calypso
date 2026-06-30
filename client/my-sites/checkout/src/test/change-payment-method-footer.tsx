/**
 * @jest-environment jsdom
 */
import {
	CheckoutProvider,
	CheckoutStepGroup,
	CheckoutFormSubmit,
	PaymentMethodStep,
	makeSuccessResponse,
} from '@automattic/composite-checkout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ChangePaymentMethodFooter } from 'calypso/my-sites/checkout/src/components/checkout-main-content';
import { createReduxStore } from 'calypso/state';
import type { PaymentMethod } from '@automattic/composite-checkout';

function createMockPaymentMethod( id: string ): PaymentMethod {
	return {
		id,
		paymentProcessorId: id,
		label: <span>{ id }</span>,
		activeContent: <span>{ `${ id } active` }</span>,
		submitButton: <button>{ `Pay with ${ id }` }</button>,
		getAriaLabel: () => id,
	};
}

function TestWrapper( { paymentMethods }: { paymentMethods: PaymentMethod[] } ) {
	const store = createReduxStore( {} );
	const queryClient = useMemo( () => new QueryClient(), [] );
	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<CheckoutProvider
					paymentMethods={ paymentMethods }
					selectFirstAvailablePaymentMethod
					paymentProcessors={ Object.fromEntries(
						paymentMethods.map( ( method ) => [
							method.paymentProcessorId,
							() => Promise.resolve( makeSuccessResponse( 'ok' ) ),
						] )
					) }
				>
					<CheckoutStepGroup>
						<PaymentMethodStep />
						<CheckoutFormSubmit
							submitButtonFooter={ <ChangePaymentMethodFooter stepId="payment-method-step" /> }
						/>
					</CheckoutStepGroup>
				</CheckoutProvider>
			</QueryClientProvider>
		</ReduxProvider>
	);
}

describe( 'ChangePaymentMethodFooter', () => {
	it( 'renders the "Use a different payment method" link when more than one payment method is available', async () => {
		render(
			<TestWrapper
				paymentMethods={ [
					createMockPaymentMethod( 'method-a' ),
					createMockPaymentMethod( 'method-b' ),
				] }
			/>
		);
		await waitFor( () => {
			expect( screen.getByText( 'Use a different payment method' ) ).toBeVisible();
		} );
	} );

	it( 'does not render the link when only one payment method is available', async () => {
		render( <TestWrapper paymentMethods={ [ createMockPaymentMethod( 'method-a' ) ] } /> );
		// Wait for the single submit button to confirm the form has rendered.
		await waitFor( () => {
			expect( screen.getByText( 'Pay with method-a' ) ).toBeVisible();
		} );
		expect( screen.queryByText( 'Use a different payment method' ) ).not.toBeInTheDocument();
	} );

	it( 'scrolls to the payment method step when the link is clicked', async () => {
		const scrollIntoView = jest.fn();
		window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
		render(
			<TestWrapper
				paymentMethods={ [
					createMockPaymentMethod( 'method-a' ),
					createMockPaymentMethod( 'method-b' ),
				] }
			/>
		);
		const link = await screen.findByText( 'Use a different payment method' );
		await userEvent.click( link );
		await waitFor( () => {
			expect( scrollIntoView ).toHaveBeenCalledWith( { behavior: 'smooth', block: 'start' } );
		} );
		expect( ( scrollIntoView.mock.instances[ 0 ] as HTMLElement ).id ).toBe(
			'payment-method-step'
		);
	} );
} );
