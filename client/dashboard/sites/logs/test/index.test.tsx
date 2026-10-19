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

function mockPhpLogs( logs: unknown[] ) {
	nock( API_BASE )
		.persist()
		.get( `/wpcom/v2/sites/${ mockSiteId }/hosting/error-logs` )
		.query( true )
		.reply( 200, { data: { total_results: logs.length, logs, scroll_id: null } } );
}

beforeEach( () => {
	mockUserPreferences();
	mockSiteAndSettings();
} );

describe( 'SiteLogs page', () => {
	test( 'shows the custom error log notice when the PHP errors log is empty', async () => {
		mockPhpLogs( [] );
		render( <SiteLogs logType={ LogType.PHP } siteSlug="test-site" /> );

		expect( await screen.findByText( /paths aren’t shown here/ ) ).toBeVisible();
	} );

	test( 'does not show the custom error log notice when PHP errors are present', async () => {
		mockPhpLogs( [
			{
				timestamp: '2026-06-19T00:00:00Z',
				severity: 'Warning',
				message: 'Something happened',
				kind: 'warning',
				name: 'E_WARNING',
				file: '/wp-content/plugins/example/example.php',
				line: 42,
				atomic_site_id: mockSiteId,
			},
		] );
		render( <SiteLogs logType={ LogType.PHP } siteSlug="test-site" /> );

		// Wait for the log row to render before asserting the notice is absent.
		expect( await screen.findByText( 'Something happened' ) ).toBeVisible();
		expect( screen.queryByText( /paths aren’t shown here/ ) ).not.toBeInTheDocument();
	} );

	test( 'does not show the custom error log notice on the Web server log', async () => {
		render( <SiteLogs logType={ LogType.SERVER } siteSlug="test-site" /> );

		// Wait for the page to settle on a stable element before asserting absence.
		await screen.findByRole( 'button', { name: /^Date range:/ } );

		expect( screen.queryByText( /paths aren’t shown here/ ) ).not.toBeInTheDocument();
	} );

	test( 'URL from/to params are normalized from ms to seconds', async () => {
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

	test( 'ms URL params stay normalized when the Activity view resets pagination on mount', async () => {
		const msFrom = Date.UTC( 2024, 9, 27, 0, 0, 0 );
		const msTo = Date.UTC( 2024, 9, 28, 23, 59, 59 );
		window.history.pushState( {}, '', `/?from=${ msFrom }&to=${ msTo }&page=2` );

		render( <SiteLogs logType={ LogType.ACTIVITY } siteSlug="test-site" /> );

		await screen.findByRole( 'button', { name: /^Date range:/ } );
		await waitFor( () => {
			const params = new URLSearchParams( window.location.search );
			expect( params.get( 'from' ) ).toBe( String( msFrom / 1000 ) );
			expect( params.get( 'to' ) ).toBe( String( msTo / 1000 ) );
		} );
	} );

	test( 'a reversed URL range is not sent to the logs API', async () => {
		const msFrom = Date.UTC( 2024, 9, 28, 23, 59, 59 );
		const msTo = Date.UTC( 2024, 9, 27, 0, 0, 0 );
		window.history.pushState( {}, '', `/?from=${ msFrom }&to=${ msTo }` );

		const requestedRanges: Array< { start: number; end: number } > = [];
		nock( API_BASE )
			.persist()
			.get( `/wpcom/v2/sites/${ mockSiteId }/hosting/error-logs` )
			.query( ( query ) => {
				requestedRanges.push( { start: Number( query.start ), end: Number( query.end ) } );
				return true;
			} )
			.reply( 200, { data: { total_results: 0, logs: [], scroll_id: null } } );

		render( <SiteLogs logType={ LogType.PHP } siteSlug="test-site" /> );

		await waitFor( () => expect( requestedRanges.length ).toBeGreaterThan( 0 ) );
		requestedRanges.forEach( ( { start, end } ) => expect( start ).toBeLessThanOrEqual( end ) );
	} );

	test( 'date range picker shows the dates from ms URL params', async () => {
		const msFrom = Date.UTC( 2024, 9, 27, 0, 0, 0 );
		const msTo = Date.UTC( 2024, 9, 28, 23, 59, 59 );
		window.history.pushState( {}, '', `/?from=${ msFrom }&to=${ msTo }` );

		render( <SiteLogs logType={ LogType.PHP } siteSlug="test-site" /> );

		expect(
			await screen.findByRole( 'button', { name: /^Date range:.*Oct 27, 2024.*Oct 28, 2024/ } )
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
