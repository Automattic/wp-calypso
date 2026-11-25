/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import StudioThankYou from '../studio-thank-you';
import type { ReceiptPurchase } from '../receipt';

const purchases = [
	{ productSlug: 'studio-cloud-monthly', productName: 'Studio Cloud' },
] as ReceiptPurchase[];

describe( 'StudioThankYou', () => {
	it( 'names the plan that was bought', () => {
		render( <StudioThankYou purchases={ purchases } /> );

		expect( screen.getByText( 'Studio Cloud is ready to use in WordPress Studio.' ) ).toBeVisible();
	} );

	it( 'lists the purchase with the Studio logo, below the page header', () => {
		const { container } = render( <StudioThankYou purchases={ purchases } /> );

		const product = container.querySelector( '.thank-you__products .thank-you__product' );
		expect( product ).toHaveTextContent( 'Studio Cloud' );
		expect( screen.getByRole( 'img', { name: "Studio Cloud's icon" } ) ).toHaveClass(
			'thank-you__product-icon'
		);
		// A siteless purchase has no site-scoped purchases page.
		expect( product ).toContainElement( screen.getByRole( 'link', { name: 'Manage purchase' } ) );
		expect( screen.getByRole( 'link', { name: 'Manage purchase' } ) ).toHaveAttribute(
			'href',
			'/me/purchases'
		);
		expect( container.querySelector( '.thank-you__header-title' ) ).toHaveTextContent(
			'Thank you for your purchase'
		);
	} );

	// The buyer may not have the desktop app, and Studio has no web app yet.
	it( 'links to neither the desktop app nor the web', () => {
		render( <StudioThankYou purchases={ purchases } /> );

		expect( screen.getAllByRole( 'link' ).map( ( link ) => link.textContent ) ).toEqual( [
			'Manage purchase',
		] );
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );
} );
