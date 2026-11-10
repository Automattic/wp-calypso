/**
 * @jest-environment jsdom
 */

import { PRODUCT_AI_CREDITS_LIFETIME, PRODUCT_STUDIO_CODE_AI_CREDITS } from '@automattic/api-core';
import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { CheckoutProvider } from '@automattic/composite-checkout';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { render, screen } from '@testing-library/react';
import CheckoutPayButtonFooter from '../checkout-pay-button-footer';
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

function renderFooter( cart: ResponseCart, selectedPaymentMethodId = 'card' ) {
	return render(
		<CheckoutProvider
			paymentMethods={ [ makePaymentMethod( 'card' ), makePaymentMethod( 'free-purchase' ) ] }
			paymentProcessors={ {} }
			initiallySelectedPaymentMethodId={ selectedPaymentMethodId }
		>
			<CheckoutPayButtonFooter cart={ cart } />
		</CheckoutProvider>
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

		const { container } = renderFooter( cart );

		expect( screen.getByText( /money back guarantee/i ) ).toBeInTheDocument();
		// 5 direct children: SSL trust line, refund trust line, divider, legal notice, processor notice.
		const wrapper = container.querySelector( '.checkout-pay-button-footer' );
		expect( wrapper?.childElementCount ).toBe( 5 );
	} );

	it( 'omits the entire refund row for a cart with no refund window', () => {
		const { container } = renderFooter( getEmptyResponseCart() );

		expect( screen.queryByText( /money back guarantee/i ) ).not.toBeInTheDocument();
		// The flex Wrapper has gap: 8px between children — leaving an empty
		// refund row in the DOM would add dead space above the divider. Confirm
		// the row's wrapper element is gone, not just its inner content.
		const wrapper = container.querySelector( '.checkout-pay-button-footer' );
		// 4 direct children: SSL trust line, divider, legal notice, processor notice (modal is closed).
		expect( wrapper?.childElementCount ).toBe( 4 );
	} );

	it( 'omits the SSL line when the free purchase method is selected', () => {
		const { container } = renderFooter( getEmptyResponseCart(), 'free-purchase' );

		expect( screen.queryByText( /SSL secure payment/ ) ).not.toBeInTheDocument();
		// 3 direct children: divider, legal notice, processor notice.
		const wrapper = container.querySelector( '.checkout-pay-button-footer' );
		expect( wrapper?.childElementCount ).toBe( 3 );
	} );

	it( 'shows the SSL line on a free cart when a card is selected', () => {
		renderFooter( getEmptyResponseCart(), 'card' );

		expect( screen.getByText( /SSL secure payment/ ) ).toBeVisible();
	} );

	it( 'links the AI Credits Guidelines for a cart containing Studio Code AI Credits', () => {
		renderFooter( cartWith( PLAN_PREMIUM, PRODUCT_STUDIO_CODE_AI_CREDITS ) );

		expect( screen.getByRole( 'link', { name: 'AI Credits Guidelines' } ) ).toHaveAttribute(
			'href',
			'https://developer.wordpress.com/docs/developer-tools/studio/studio-code/ai-credits-guidelines/'
		);
		// The standard notice is unaffected by the extra line.
		expect(
			screen.getByRole( 'button', { name: 'View billing and renewal details' } )
		).toBeVisible();
	} );

	it( 'omits the AI Credits Guidelines for a cart containing AI Credits', () => {
		renderFooter( cartWith( PLAN_PREMIUM, PRODUCT_AI_CREDITS_LIFETIME ) );

		expect(
			screen.queryByRole( 'link', { name: 'AI Credits Guidelines' } )
		).not.toBeInTheDocument();
	} );

	it( 'omits the AI Credits Guidelines for any other cart', () => {
		renderFooter( cartWith( PLAN_PREMIUM ) );

		expect(
			screen.queryByRole( 'link', { name: 'AI Credits Guidelines' } )
		).not.toBeInTheDocument();
	} );

	it( 'shows the payment processor disclosure below the terms notice', () => {
		const { container } = renderFooter( cartWith( PLAN_PREMIUM ) );

		const wrapper = container.querySelector( '.checkout-pay-button-footer' );
		expect( screen.getByText( /Your payment will be processed by/ ) ).toBeVisible();
		expect( wrapper?.lastElementChild ).toHaveClass( 'checkout-processor-notice' );
	} );
} );
