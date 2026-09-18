/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import StudioReturn from '../index';

// Only `recordTracksEvent` is stubbed — PageViewTracker pulls other action creators from this
// module and needs the real ones.
jest.mock( 'calypso/state/analytics/actions', () => ( {
	...jest.requireActual( 'calypso/state/analytics/actions' ),
	recordTracksEvent: jest.fn( () => ( { type: 'TEST_TRACKS_EVENT' } ) ),
} ) );

const STUDIO_SITE_ID = 'b419d647-95e0-4b32-95fc-6ee255aa465d';
const EXPECTED_DEEP_LINK = `wp-studio://checkout-return?studioSiteId=${ STUDIO_SITE_ID }&checkoutResult=cancelled`;

describe( 'StudioReturn', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		Object.defineProperty( window, 'location', {
			value: { href: 'https://wordpress.com/checkout/studio-return' },
			writable: true,
		} );
	} );

	it( 'hands off to Studio on mount without waiting for a click', () => {
		renderWithProvider( <StudioReturn studioSiteId={ STUDIO_SITE_ID } /> );

		expect( window.location.href ).toBe( EXPECTED_DEEP_LINK );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_studio_checkout_return',
			expect.objectContaining( {
				checkout_result: 'cancelled',
				click: false,
				studio_site_id: STUDIO_SITE_ID,
			} )
		);
	} );

	it( 'echoes studioReturnTo when Studio supplied one', () => {
		renderWithProvider(
			<StudioReturn studioSiteId={ STUDIO_SITE_ID } studioReturnTo="publish-site" />
		);

		expect( window.location.href ).toContain( 'studioReturnTo=publish-site' );
	} );

	it( 're-fires the handoff from the Open Studio button, recording it as a click', async () => {
		renderWithProvider( <StudioReturn studioSiteId={ STUDIO_SITE_ID } /> );

		// The mount effect already navigated; reset so the click is observable on its own.
		window.location.href = 'https://wordpress.com/checkout/studio-return';

		await userEvent.click( screen.getByRole( 'button', { name: /open studio/i } ) );

		expect( window.location.href ).toBe( EXPECTED_DEEP_LINK );
		expect( recordTracksEvent ).toHaveBeenLastCalledWith(
			'calypso_studio_checkout_return',
			expect.objectContaining( { click: true } )
		);
	} );
} );
