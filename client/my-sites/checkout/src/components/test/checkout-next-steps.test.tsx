/**
 * @jest-environment jsdom
 */

import { PLAN_BUSINESS, PLAN_PREMIUM, WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import { checkoutTheme } from '@automattic/composite-checkout';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';
import CheckoutNextSteps from '../checkout-next-steps';
import type { ResponseCart, ResponseCartProductExtra } from '@automattic/shopping-cart';

function renderNextSteps( cart: ResponseCart ) {
	return render(
		<ThemeProvider theme={ checkoutTheme }>
			<CheckoutNextSteps responseCart={ cart } />
		</ThemeProvider>
	);
}

function cartWith( product_slug: string, extra: ResponseCartProductExtra = {} ): ResponseCart {
	const cart = getEmptyResponseCart();
	cart.products.push( { ...getEmptyResponseCartProduct(), product_slug, extra } );
	return cart;
}

function getSteps() {
	return screen.getAllByRole( 'listitem' ).map( ( item ) => ( {
		text: item.textContent,
		icon: item.querySelector( '.checkout-next-steps__icon' )?.className.match( /is-(\w+)/ )?.[ 1 ],
	} ) );
}

describe( 'CheckoutNextSteps', () => {
	it( 'renders the four DIFM offer steps for a Business plan flagged with difm_offer', () => {
		renderNextSteps( cartWith( PLAN_BUSINESS, { difm_offer: true } ) );

		expect( getSteps() ).toEqual( [
			{ text: 'Submit build request', icon: 'completed' },
			{ text: 'Upgrade to Business', icon: 'current' },
			{ text: 'Get in touch with the team with final details', icon: 'next' },
			{ text: 'Receive your finished site in 4 business days or less!', icon: 'next' },
		] );
		expect( screen.getByText( 'Upgrade to Business' ).tagName ).toBe( 'B' );
	} );

	it( 'renders nothing for an unflagged Business plan', () => {
		const { container } = renderNextSteps( cartWith( PLAN_BUSINESS ) );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing for a flagged product that is not a Business plan', () => {
		const { container } = renderNextSteps( cartWith( PLAN_PREMIUM, { difm_offer: true } ) );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders the existing five DIFM steps for a difm_lite cart', () => {
		renderNextSteps( cartWith( WPCOM_DIFM_LITE ) );

		expect( getSteps() ).toEqual( [
			{ text: 'Submit business information', icon: 'completed' },
			{ text: 'Choose a design', icon: 'completed' },
			{ text: 'Checkout', icon: 'current' },
			{ text: 'Submit content for new site', icon: 'next' },
			{ text: 'Receive your finished site in 4 business days or less!', icon: 'next' },
		] );
	} );

	it( 'keeps the five DIFM steps when a difm_lite cart also has a flagged Business plan', () => {
		const cart = cartWith( WPCOM_DIFM_LITE );
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			product_slug: PLAN_BUSINESS,
			extra: { difm_offer: true },
		} );

		renderNextSteps( cart );

		expect( getSteps() ).toHaveLength( 5 );
		expect( screen.getByText( 'Submit business information' ) ).toBeInTheDocument();
	} );
} );
