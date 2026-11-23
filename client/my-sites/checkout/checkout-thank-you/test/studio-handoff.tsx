/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import StudioHandoff from '../studio-handoff';

jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

const STUDIO_SITE_ID = 'b419d647-95e0-4b32-95fc-6ee255aa465d';

describe( 'StudioHandoff', () => {
	it( 'still hands back to Studio when its notice is hidden', () => {
		const search = `?studioSiteId=${ STUDIO_SITE_ID }`;
		Object.defineProperty( window, 'location', {
			value: { href: `https://wordpress.com/checkout/thank-you/no-site/123${ search }`, search },
			writable: true,
		} );

		const { container } = render( <StudioHandoff receiptId={ 123 } hideNotice /> );

		expect( container ).toBeEmptyDOMElement();
		expect( window.location.href ).toBe(
			`wp-studio://checkout-return?studioSiteId=${ STUDIO_SITE_ID }&checkoutResult=success`
		);
	} );
} );
