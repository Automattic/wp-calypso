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

const STUDIO_SENTENCE =
	'By checking out, you agree to our Terms of Service and AI Credits Guidelines, and have read our Privacy Policy. View billing and renewal details';
const SHARED_SENTENCE =
	'By purchasing, you accept the Terms of Service and Privacy Policy. View billing and renewal details';

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

function legalNoticeText(): string {
	// Both sentences render across several elements, so find one link they share.
	return screen.getByRole( 'link', { name: 'Privacy Policy' } ).closest( 'p' )?.textContent ?? '';
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

	it( 'links the AI Credits Guidelines for a Studio Code AI Credits cart', () => {
		renderFooter( cartWith( PRODUCT_STUDIO_CODE_AI_CREDITS ) );

		expect( legalNoticeText() ).toBe( STUDIO_SENTENCE );
		// TODO: SHILL-2355 - update alongside AI_CREDITS_GUIDELINES_URL when Legal publishes the doc.
		expect( screen.getByRole( 'link', { name: 'AI Credits Guidelines' } ) ).toHaveAttribute(
			'href',
			'#ai-credits-guidelines-pending'
		);
	} );

	it( 'renders the standard legal sentence for a plan cart', () => {
		renderFooter( cartWith( PLAN_PREMIUM ) );

		expect( legalNoticeText() ).toBe( SHARED_SENTENCE );
		expect(
			screen.queryByRole( 'link', { name: 'AI Credits Guidelines' } )
		).not.toBeInTheDocument();
	} );

	it( 'keeps the Terms of Service and Privacy Policy links on a mixed cart', () => {
		renderFooter( cartWith( PLAN_PREMIUM, PRODUCT_STUDIO_CODE_AI_CREDITS ) );

		expect( legalNoticeText() ).toBe( STUDIO_SENTENCE );
		expect( screen.getByRole( 'link', { name: 'Terms of Service' } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/tos/'
		);
		expect( screen.getByRole( 'link', { name: 'Privacy Policy' } ) ).toHaveAttribute(
			'href',
			'https://automattic.com/privacy/'
		);
		expect(
			screen.getByRole( 'button', { name: 'View billing and renewal details' } )
		).toBeVisible();
	} );
} );
