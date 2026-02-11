/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { createQueryClientBuilder, render } from '../../../test-utils';
import TimeMismatchNotice from '../index';
import type { CalypsoUserPreferencesRequestBody } from '@automattic/api-core';

function getOffsetHours() {
	const now = new Date();
	return -now.getTimezoneOffset() / 60;
}

describe( 'TimeMismatchNotice', () => {
	// Force a deterministic local timezone offset: -120 minutes => offsetHours = 2
	const mockTimezoneOffsetMinutes = -120;

	beforeEach( () => {
		jest.spyOn( Date.prototype, 'getTimezoneOffset' ).mockReturnValue( mockTimezoneOffsetMinutes );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	test( 'does not render if siteTime matches local timezone offset', () => {
		const offsetHours = getOffsetHours();
		const { queryByRole } = render(
			<TimeMismatchNotice
				siteId={ 123 }
				siteTime={ offsetHours }
				settingsUrl="https://example.com"
			/>,
			{ queryClient: createQueryClientBuilder().withStaleTime( Infinity ).build() }
		);

		expect( queryByRole( 'button', { name: /dismiss/i } ) ).toBeNull();
	} );

	test( 'renders warning notice when siteTime differs and no dismissal is stored', async () => {
		const offsetHours = getOffsetHours();
		render(
			<TimeMismatchNotice
				siteId={ 123 }
				siteTime={ offsetHours + 1 }
				settingsUrl="https://example.com"
			/>,
			{ queryClient: createQueryClientBuilder().withStaleTime( Infinity ).build() }
		);

		expect( await screen.findByRole( 'button', { name: /dismiss/i } ) ).toBeVisible();
		expect( await screen.findByRole( 'link', { name: /update it if needed/i } ) ).toBeVisible();
	} );

	test( 'does not render when previously dismissed with same offset', () => {
		const offsetHours = getOffsetHours();

		const queryClient = createQueryClientBuilder()
			.withStaleTime( Infinity )
			.setPreference(
				'hosting-dashboard-time-mismatch-warning-dismissed-123',
				JSON.stringify( {
					dismissedAt: '2025-01-01T00:00:00.000Z',
					offsetHours,
				} )
			)
			.build();

		const { queryByRole } = render(
			<TimeMismatchNotice
				siteId={ 123 }
				siteTime={ offsetHours + 2 }
				settingsUrl="https://example.com"
			/>,
			{ queryClient }
		);

		expect( queryByRole( 'button', { name: /dismiss/i } ) ).toBeNull();
	} );

	test( 'clicking the settings link records an analytics event', async () => {
		const user = userEvent.setup();
		const offsetHours = getOffsetHours();
		const { recordTracksEvent } = render(
			<TimeMismatchNotice
				siteId={ 987 }
				siteTime={ offsetHours + 1 }
				settingsUrl="https://example.com"
			/>,
			{ queryClient: createQueryClientBuilder().withStaleTime( Infinity ).build() }
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

		let requestBody: CalypsoUserPreferencesRequestBody | undefined;
		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/me/preferences', ( body ) => {
				requestBody = body;
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
			/>,
			{ queryClient: createQueryClientBuilder().withStaleTime( Infinity ).build() }
		);

		await user.click( await screen.findByRole( 'button', { name: /dismiss/i } ) );

		expect(
			JSON.parse(
				requestBody?.calypso_preferences[
					'hosting-dashboard-time-mismatch-warning-dismissed-321'
				] ?? ''
			)
		).toEqual(
			expect.objectContaining( {
				dismissedAt: expect.any( String ),
				offsetHours: expect.closeTo( offsetHours, 10 ),
			} )
		);

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

		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: {} } );

		render(
			<TimeMismatchNotice
				siteId={ 111 }
				siteTime={ offsetHours + 3 }
				settingsUrl="https://example.com"
			/>,
			{ queryClient: createQueryClientBuilder().withStaleTime( Infinity ).build() }
		);

		// Click dismiss to start the mutation — notice hides immediately (isPending)
		await user.click( await screen.findByRole( 'button', { name: /dismiss/i } ) );
		expect( screen.queryByRole( 'button', { name: /dismiss/i } ) ).toBeNull();
	} );
} );
