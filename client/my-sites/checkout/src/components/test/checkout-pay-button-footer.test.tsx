/**
 * @jest-environment jsdom
 */

import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { checkoutTheme } from '@automattic/composite-checkout';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';
import CheckoutPayButtonFooter from '../checkout-pay-button-footer';
import type { ResponseCart } from '@automattic/shopping-cart';

function renderFooter( cart: ResponseCart ) {
	return render(
		<ThemeProvider theme={ checkoutTheme }>
			<CheckoutPayButtonFooter cart={ cart } />
		</ThemeProvider>
	);
}

describe( 'CheckoutPayButtonFooter', () => {
	it( 'renders the money-back-guarantee line for a cart that yields a refund window', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			item_subtotal_integer: 5,
			product_slug: PLAN_PREMIUM,
		} );

		renderFooter( cart );

		expect( screen.getByText( /money back guarantee/i ) ).toBeInTheDocument();
	} );

	it( 'omits the money-back-guarantee line for a cart with no refund window', () => {
		renderFooter( getEmptyResponseCart() );

		expect( screen.queryByText( /money back guarantee/i ) ).not.toBeInTheDocument();
	} );
} );
