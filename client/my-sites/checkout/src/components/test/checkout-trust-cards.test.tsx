/**
 * @jest-environment jsdom
 */

import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { CheckoutProvider } from '@automattic/composite-checkout';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { render, screen } from '@testing-library/react';
import CheckoutTrustCards from '../checkout-trust-cards';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';

function makePaymentMethod( id: string ): PaymentMethod {
	return {
		id,
		paymentProcessorId: id,
		label: id,
		submitButton: <button />,
		getAriaLabel: () => id,
	};
}

function renderTrustCards( cart: ResponseCart, selectedPaymentMethodId = 'card' ) {
	return render(
		<CheckoutProvider
			paymentMethods={ [ makePaymentMethod( 'card' ), makePaymentMethod( 'free-purchase' ) ] }
			paymentProcessors={ {} }
			initiallySelectedPaymentMethodId={ selectedPaymentMethodId }
		>
			<CheckoutTrustCards cart={ cart } />
		</CheckoutProvider>
	);
}

function premiumCart(): ResponseCart {
	const cart = getEmptyResponseCart();
	cart.products.push( {
		...getEmptyResponseCartProduct(),
		item_subtotal_integer: 5,
		product_slug: PLAN_PREMIUM,
	} );
	return cart;
}

describe( 'CheckoutTrustCards', () => {
	it( 'renders the refund and SSL cards for a cart that yields a refund window', () => {
		renderTrustCards( premiumCart() );

		expect( screen.getByText( /day money back/i ) ).toBeVisible();
		expect( screen.getByText( 'SSL secure payment' ) ).toBeVisible();
	} );

	it( 'omits the refund card for a cart with no refund window', () => {
		renderTrustCards( getEmptyResponseCart() );

		expect( screen.queryByText( /day money back/i ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'SSL secure payment' ) ).toBeVisible();
	} );

	it( 'omits the SSL card when the free purchase method is selected', () => {
		renderTrustCards( getEmptyResponseCart(), 'free-purchase' );

		expect( screen.queryByText( 'SSL secure payment' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the SSL card on a free cart when a card is selected', () => {
		renderTrustCards( getEmptyResponseCart(), 'card' );

		expect( screen.getByText( 'SSL secure payment' ) ).toBeVisible();
	} );

	it.each( [
		[ 'with a refund window', premiumCart ],
		[ 'without a refund window', getEmptyResponseCart ],
	] )( 'always renders the payment processor disclosure %s', ( _label, getCart ) => {
		renderTrustCards( getCart() );

		expect( screen.getByText( /Your payment will be processed by/ ) ).toBeVisible();
	} );
} );
