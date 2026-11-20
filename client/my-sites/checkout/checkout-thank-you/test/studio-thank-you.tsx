/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StudioThankYou from '../studio-thank-you';
import type { ReceiptPurchase } from '../receipt';

jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

const STUDIO_SITE_ID = 'b419d647-95e0-4b32-95fc-6ee255aa465d';
const purchases = [
	{ productSlug: 'studio-cloud-monthly', productName: 'Studio Cloud' },
] as ReceiptPurchase[];

function setLocation( search: string ) {
	Object.defineProperty( window, 'location', {
		value: { href: `https://wordpress.com/checkout/thank-you/no-site/123${ search }`, search },
		writable: true,
	} );
}

describe( 'StudioThankYou', () => {
	it( 'names the plan that was bought', () => {
		setLocation( '?checkout_type=studio' );
		render( <StudioThankYou purchases={ purchases } /> );

		expect( screen.getByText( 'Studio Cloud is ready to use in WordPress Studio.' ) ).toBeVisible();
	} );

	it( 'lists the purchase with the Studio logo, below the page header', () => {
		setLocation( '?checkout_type=studio' );
		const { container } = render( <StudioThankYou purchases={ purchases } /> );

		const product = container.querySelector( '.thank-you__products .thank-you__product' );
		expect( product ).toHaveTextContent( 'Studio Cloud' );
		expect( screen.getByRole( 'img', { name: "Studio Cloud's icon" } ) ).toHaveClass(
			'thank-you__product-icon'
		);
		expect( container.querySelector( '.thank-you__header-title' ) ).toHaveTextContent(
			'Thank you for your purchase'
		);
		expect( container.querySelector( '.thank-you__header-buttons' ) ).toContainElement(
			screen.getByRole( 'link', { name: 'Open Studio on the web' } )
		);
	} );

	describe( 'for a buyer who did not come from the Studio app', () => {
		beforeEach( () => setLocation( '?checkout_type=studio' ) );

		it( 'leads with the web app and offers the desktop app second', () => {
			render( <StudioThankYou purchases={ purchases } /> );

			const webApp = screen.getByRole( 'link', { name: 'Open Studio on the web' } );
			const desktopApp = screen.getByRole( 'button', { name: 'Open the Studio app' } );

			expect( webApp ).toHaveAttribute( 'href', 'https://app.wordpress.studio/' );
			expect( webApp ).toHaveClass( 'is-primary' );
			expect( desktopApp ).not.toHaveClass( 'is-primary' );
			expect( webApp.compareDocumentPosition( desktopApp ) ).toBe(
				Node.DOCUMENT_POSITION_FOLLOWING
			);
		} );

		it( 'opens the Studio app on request', async () => {
			render( <StudioThankYou purchases={ purchases } /> );

			await userEvent.click( screen.getByRole( 'button', { name: 'Open the Studio app' } ) );

			expect( window.location.href ).toBe( 'wp-studio://' );
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_studio_checkout_open_app_click' );
		} );
	} );

	describe( 'for a buyer who came from the Studio app', () => {
		beforeEach( () => setLocation( `?studioSiteId=${ STUDIO_SITE_ID }&checkout_type=studio` ) );

		it( 'leads with the desktop app and offers the web app second', () => {
			render( <StudioThankYou purchases={ purchases } /> );

			const desktopApp = screen.getByRole( 'button', { name: 'Open the Studio app' } );
			const webApp = screen.getByRole( 'link', { name: 'Open Studio on the web' } );

			expect( webApp ).toHaveAttribute( 'href', 'https://app.wordpress.studio/' );
			expect( desktopApp ).toHaveClass( 'is-primary' );
			expect( webApp ).not.toHaveClass( 'is-primary' );
			expect( desktopApp.compareDocumentPosition( webApp ) ).toBe(
				Node.DOCUMENT_POSITION_FOLLOWING
			);
		} );

		it( 'hands back to the Studio site the buyer came from', async () => {
			render( <StudioThankYou purchases={ purchases } /> );

			await userEvent.click( screen.getByRole( 'button', { name: 'Open the Studio app' } ) );

			expect( window.location.href ).toBe(
				`wp-studio://checkout-return?studioSiteId=${ STUDIO_SITE_ID }&checkoutResult=success`
			);
		} );
	} );

	it( 'records the same event as the handoff notice when handing back on a click', async () => {
		setLocation( `?studioSiteId=${ STUDIO_SITE_ID }&checkout_type=studio` );
		render( <StudioThankYou purchases={ purchases } receiptId={ 123 } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Open the Studio app' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_studio_checkout_return', {
			checkout_result: 'success',
			click: true,
			studio_site_id: STUDIO_SITE_ID,
			studio_return_to: undefined,
			blog_id: undefined,
			receipt_id: 123,
		} );
	} );
} );
