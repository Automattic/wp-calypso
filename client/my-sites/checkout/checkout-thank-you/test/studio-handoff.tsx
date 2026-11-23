/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StudioHandoff from '../studio-handoff';

jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

const STUDIO_SITE_ID = 'b419d647-95e0-4b32-95fc-6ee255aa465d';

function setLocation( search: string ) {
	Object.defineProperty( window, 'location', {
		value: { href: `https://wordpress.com/checkout/thank-you/no-site/123${ search }`, search },
		writable: true,
	} );
}

describe( 'StudioHandoff', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		setLocation( `?studioSiteId=${ STUDIO_SITE_ID }` );
	} );

	it( 'hands back to Studio and offers to open it again', () => {
		render( <StudioHandoff receiptId={ 123 } /> );

		expect( screen.getByText( 'Your purchase is ready in WordPress Studio.' ) ).toBeVisible();
		expect( screen.getByText( 'Open Studio' ) ).toBeVisible();
		expect( window.location.href ).toBe(
			`wp-studio://checkout-return?studioSiteId=${ STUDIO_SITE_ID }&checkoutResult=success`
		);
	} );

	it( 'records a click on the notice apart from the automatic hand-back', async () => {
		render( <StudioHandoff receiptId={ 123 } /> );

		await userEvent.click( screen.getByText( 'Open Studio' ) );

		expect( recordTracksEvent ).toHaveBeenLastCalledWith( 'calypso_studio_checkout_return', {
			checkout_result: 'success',
			click: true,
			studio_site_id: STUDIO_SITE_ID,
			studio_return_to: undefined,
			blog_id: undefined,
			receipt_id: 123,
		} );
	} );

	it( 'renders nothing without the round-trip params', () => {
		setLocation( '' );

		const { container } = render( <StudioHandoff receiptId={ 123 } /> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
