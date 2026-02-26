/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import TimeMismatchNotice from '../index';

function getOffsetHours() {
	const now = new Date();
	return -now.getTimezoneOffset() / 60;
}

function mockPreferences( prefs: Record< string, string > = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: prefs } );
}

describe( 'TimeMismatchNotice', () => {
	// Force a deterministic local timezone offset: -120 minutes => offsetHours = 2
	const mockTimezoneOffsetMinutes = -120;

	beforeEach( () => {
		jest.spyOn( Date.prototype, 'getTimezoneOffset' ).mockReturnValue( mockTimezoneOffsetMinutes );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	test( 'does not render if siteTime matches local timezone offset', async () => {
		const offsetHours = getOffsetHours();
		mockPreferences();

		render(
			<TimeMismatchNotice
				siteId={ 123 }
				siteTime={ offsetHours }
				settingsUrl="https://example.com"
			/>
		);

		await waitFor( () => {
			expect( screen.queryByRole( 'button', { name: /dismiss/i } ) ).toBeNull();
		} );
	} );

	test( 'renders warning notice when siteTime differs and no dismissal is stored', async () => {
		const offsetHours = getOffsetHours();
		mockPreferences();

		render(
			<TimeMismatchNotice
				siteId={ 123 }
				siteTime={ offsetHours + 1 }
				settingsUrl="https://example.com"
			/>
		);

		expect( await screen.findByRole( 'button', { name: /dismiss/i } ) ).toBeVisible();
		expect( await screen.findByRole( 'link', { name: /update it if needed/i } ) ).toBeVisible();
	} );

	test( 'does not render when previously dismissed with same offset', async () => {
		const offsetHours = getOffsetHours();

		mockPreferences( {
			'hosting-dashboard-time-mismatch-warning-dismissed-123': JSON.stringify( {
				dismissedAt: '2025-01-01T00:00:00.000Z',
				offsetHours,
			} ),
		} );

		render(
			<TimeMismatchNotice
				siteId={ 123 }
				siteTime={ offsetHours + 2 }
				settingsUrl="https://example.com"
			/>
		);

		await waitFor( () => {
			expect( screen.queryByRole( 'button', { name: /dismiss/i } ) ).toBeNull();
		} );
	} );

	test( 'clicking the settings link records an analytics event', async () => {
		const user = userEvent.setup();
		const offsetHours = getOffsetHours();
		mockPreferences();

		const { recordTracksEvent } = render(
			<TimeMismatchNotice
				siteId={ 987 }
				siteTime={ offsetHours + 1 }
				settingsUrl="https://example.com"
			/>
		);

		await user.click( await screen.findByRole( 'link', { name: /update it if needed/i } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_time_mismatch_banner_settings_link_click',
			expect.objectContaining( { site_id: 987 } )
		);
	} );

	test( 'clicking dismiss persists preference and records analytics', async () => {
		const user = userEvent.setup();
		const offsetHours = getOffsetHours();
		mockPreferences();

		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/me/preferences', ( body ) => {
				expect(
					JSON.parse(
						body.calypso_preferences[ 'hosting-dashboard-time-mismatch-warning-dismissed-321' ]
					)
				).toEqual(
					expect.objectContaining( {
						dismissedAt: expect.any( String ),
						offsetHours: expect.closeTo( offsetHours, 10 ),
					} )
				);
				return true;
			} )
			.reply( 200, {
				calypso_preferences: {
					[ 'hosting-dashboard-time-mismatch-warning-dismissed-321' ]: JSON.stringify( {
						dismissedAt: '2025-06-01T00:00:00.000Z',
						offsetHours,
					} ),
				},
			} );

		const { recordTracksEvent } = render(
			<TimeMismatchNotice
				siteId={ 321 }
				siteTime={ offsetHours + 1 }
				settingsUrl="https://example.com"
			/>
		);

		await user.click( await screen.findByRole( 'button', { name: /dismiss/i } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_time_mismatch_banner_close',
			expect.objectContaining( {
				site_id: 321,
				dismissed_at: expect.any( String ),
			} )
		);
	} );

	test( 'does not render while dismiss is pending', async () => {
		const user = userEvent.setup();
		const offsetHours = getOffsetHours();
		mockPreferences();

		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: {} } );

		render(
			<TimeMismatchNotice
				siteId={ 111 }
				siteTime={ offsetHours + 3 }
				settingsUrl="https://example.com"
			/>
		);

		// Click dismiss to start the mutation — notice hides immediately (isPending)
		await user.click( await screen.findByRole( 'button', { name: /dismiss/i } ) );
		expect( screen.queryByRole( 'button', { name: /dismiss/i } ) ).toBeNull();
	} );
} );
