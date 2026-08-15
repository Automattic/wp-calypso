/**
 * @jest-environment jsdom
 */

import { PRODUCT_STUDIO_CODE_AI_CREDITS } from '@automattic/api-core';
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

function cartWith( ...productSlugs: string[] ): ResponseCart {
	const cart = getEmptyResponseCart();
	cart.products.push(
		...productSlugs.map( ( product_slug ) => ( {
			...getEmptyResponseCartProduct(),
			item_subtotal_integer: 5,
			product_slug,
		} ) )
	);
	return cart;
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

	it( 'omits the entire refund row for a cart with no refund window', () => {
		const { container } = renderFooter( getEmptyResponseCart() );

		expect( screen.queryByText( /money back guarantee/i ) ).not.toBeInTheDocument();
		// The flex Wrapper has gap: 8px between children — leaving an empty
		// refund row in the DOM would add dead space above the divider. Confirm
		// the row's wrapper element is gone, not just its inner content.
		const wrapper = container.querySelector( '.checkout-pay-button-footer' );
		// 3 direct children: SSL trust line, divider, legal notice (modal is closed).
		expect( wrapper?.childElementCount ).toBe( 3 );
	} );

	it( 'links the AI Credits Guidelines for a cart containing Studio Code AI Credits', () => {
		renderFooter( cartWith( PLAN_PREMIUM, PRODUCT_STUDIO_CODE_AI_CREDITS ) );

		// TODO: SHILL-2355 - update alongside getStudioCodeAiCreditsGuidelinesUrl().
		expect( screen.getByRole( 'link', { name: 'AI Credits Guidelines' } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/tos/#ai-credits-guidelines-pending'
		);
		// The standard notice is unaffected by the extra line.
		expect(
			screen.getByRole( 'button', { name: 'View billing and renewal details' } )
		).toBeVisible();
	} );

	it( 'omits the AI Credits Guidelines for any other cart', () => {
		renderFooter( cartWith( PLAN_PREMIUM ) );

		expect(
			screen.queryByRole( 'link', { name: 'AI Credits Guidelines' } )
		).not.toBeInTheDocument();
	} );
} );
