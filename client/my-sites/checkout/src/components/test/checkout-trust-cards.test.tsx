/**
 * @jest-environment jsdom
 */

import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { checkoutTheme } from '@automattic/composite-checkout';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';
import CheckoutTrustCards from '../checkout-trust-cards';
import type { ResponseCart } from '@automattic/shopping-cart';

function renderTrustCards( cart: ResponseCart ) {
	return render(
		<ThemeProvider theme={ checkoutTheme }>
			<CheckoutTrustCards cart={ cart } />
		</ThemeProvider>
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

	it.each( [
		[ 'with a refund window', premiumCart ],
		[ 'without a refund window', getEmptyResponseCart ],
	] )( 'always renders the payment processor disclosure %s', ( _label, getCart ) => {
		renderTrustCards( getCart() );

		expect( screen.getByText( /Your payment will be processed by/ ) ).toBeVisible();
	} );
} );
