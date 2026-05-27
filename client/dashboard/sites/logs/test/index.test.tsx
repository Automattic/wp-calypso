/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { LogType } from '@automattic/api-core';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteLogs from '../index';

const API_BASE = 'https://public-api.wordpress.com';
const mockSiteId = 123;

function mockUserPreferences() {
	nock( API_BASE )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, { calypso_preferences: {} } );
}

function mockSiteAndSettings( {
	gmtOffset = 0,
	timezoneString = '',
}: { gmtOffset?: number; timezoneString?: string } = {} ) {
	nock( API_BASE )
		.get( '/rest/v1.1/sites/test-site' )
		.query( true )
		.reply( 200, {
			ID: mockSiteId,
			slug: 'test-site',
			options: { admin_url: 'https://example.com/wp-admin/' },
			is_wpcom_atomic: true,
			plan: { features: { active: [ 'full-activity-log', 'logs' ] } },
		} );
	nock( API_BASE )
		.get( `/rest/v1.4/sites/${ mockSiteId }/settings` )
		.reply( 200, { settings: { gmt_offset: gmtOffset, timezone_string: timezoneString } } );
}

beforeEach( () => {
	mockUserPreferences();
	mockSiteAndSettings();
} );

describe( 'SiteLogs page', () => {
	test.each( [
		[ LogType.ACTIVITY, 'Activity' ],
		[ LogType.PHP, 'PHP errors' ],
		[ LogType.SERVER, 'Web server' ],
	] )( 'on selecting tab %s, navigates to /%s', async ( logSlug, tabLabel ) => {
		// Different initial log type that the one under test
		const initialLogType = logSlug !== LogType.PHP ? LogType.PHP : LogType.SERVER;
		const { router } = render( <SiteLogs logType={ initialLogType } siteSlug="test-site" /> );

		// Click another tab
		await userEvent.click( await screen.findByRole( 'tab', { name: tabLabel } ) );

		await waitFor( () => {
			expect( router.state.location.pathname ).toBe( `/sites/test-site/logs/${ logSlug }` );
		} );
	} );

	test( 'URL from/to params are normalized from ms to seconds', async () => {
		// UTC day boundaries — buildTimeRangeInSeconds (called by the picker's
		// onChange-on-mount) snaps to start/end of day, so day-aligned inputs
		// round-trip exactly.
		const msFrom = Date.UTC( 2024, 9, 27, 0, 0, 0 );
		const msTo = Date.UTC( 2024, 9, 28, 23, 59, 59 );
		window.history.pushState( {}, '', `/?from=${ msFrom }&to=${ msTo }` );

		const { router } = render( <SiteLogs logType={ LogType.PHP } siteSlug="test-site" /> );

		await waitFor( () => {
			expect( router.state.location.search ).toMatchObject( {
				from: msFrom / 1000,
				to: msTo / 1000,
			} );
		} );
	} );

	test( 'date picker shows the dates implied by URL ms params', async () => {
		const msFrom = Date.UTC( 2024, 9, 27, 0, 0, 0 );
		const msTo = Date.UTC( 2024, 9, 28, 23, 59, 59 );
		window.history.pushState( {}, '', `/?from=${ msFrom }&to=${ msTo }` );

		render( <SiteLogs logType={ LogType.PHP } siteSlug="test-site" /> );

		// Picker button label is "Date range: Oct 27, 2024 to Oct 28, 2024".
		// If useDateRange parses the ms values as seconds (the bug), the label
		// shows a date in year ~56000 instead.
		expect(
			await screen.findByRole( 'button', { name: /Date range:.*Oct 27, 2024.*Oct 28, 2024/ } )
		).toBeVisible();
	} );

	test( 'auto-refresh is blocked for non-last-7 range and shows warning notice', async () => {
		render( <SiteLogs logType={ LogType.PHP } siteSlug="test-site" /> );

		// Open the picker and choose a preset which isn't auto-refresh compatible
		await userEvent.click( await screen.findByRole( 'button', { name: /^Date range:/ } ) );
		const listbox = await screen.findByRole( 'listbox', { name: 'Date range presets' } );
		await userEvent.click( within( listbox ).getByRole( 'option', { name: 'Year to date' } ) );

		const checkbox = screen.getByRole( 'checkbox', { name: 'Auto-refresh' } );
		await userEvent.click( checkbox );

		expect( checkbox ).not.toBeChecked();
		expect(
			await screen.findByText( 'Auto-refresh only works with "Last 7 days" preset' )
		).toBeVisible();
	} );

	test( 'auto-refresh is allowed for last-7 range and does not show warning notice', async () => {
		render( <SiteLogs logType={ LogType.PHP } siteSlug="test-site" /> );

		// Open the picker and explicitly choose preset which is auto-refresh compatible
		await userEvent.click( await screen.findByRole( 'button', { name: /^Date range:/ } ) );
		const listbox = await screen.findByRole( 'listbox', { name: 'Date range presets' } );
		await userEvent.click( within( listbox ).getByRole( 'option', { name: 'Last 7 days' } ) );

		const checkbox = screen.getByRole( 'checkbox', { name: 'Auto-refresh' } );
		await userEvent.click( checkbox );

		expect( checkbox ).toBeChecked();
		expect(
			screen.queryByText( 'Auto-refresh only works with "Last 7 days" preset' )
		).not.toBeInTheDocument();
	} );
} );
