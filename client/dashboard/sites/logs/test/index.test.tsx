/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { LogType } from '@automattic/api-core';
import { screen, within, waitFor } from '@testing-library/react';
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
	features = [ 'full-activity-log', 'logs' ],
	isAtomic = true,
}: { gmtOffset?: number; timezoneString?: string; features?: string[]; isAtomic?: boolean } = {} ) {
	nock( API_BASE )
		.get( '/rest/v1.1/sites/test-site' )
		.query( true )
		.reply( 200, {
			ID: mockSiteId,
			slug: 'test-site',
			options: { admin_url: 'https://example.com/wp-admin/' },
			is_wpcom_atomic: isAtomic,
			plan: { features: { active: features } },
		} );
	nock( API_BASE )
		.get( `/rest/v1.4/sites/${ mockSiteId }/settings` )
		.reply( 200, { settings: { gmt_offset: gmtOffset, timezone_string: timezoneString } } );
}

function mockPhpLogs( logs: unknown[] ) {
	const queries: Record< string, unknown >[] = [];
	nock( API_BASE )
		.persist()
		.get( `/wpcom/v2/sites/${ mockSiteId }/hosting/error-logs` )
		.query( ( query ) => {
			queries.push( query );
			return true;
		} )
		.reply( 200, { data: { total_results: logs.length, logs, scroll_id: null } } );
	return queries;
}

// jsdom has no element scrolling API used by Activity pagination.
beforeAll( () => {
	HTMLElement.prototype.scrollTo = () => {};
} );

beforeEach( () => {
	window.history.replaceState( { key: 'logs-test', __TSR_index: 3 }, '', '/' );
	mockUserPreferences();
} );

describe( '<SiteLogs>', () => {
	beforeEach( () => mockSiteAndSettings() );
	test( 'keeps selected Activity dates when resetting pagination', async () => {
		const queries: Record< string, unknown >[] = [];
		nock( API_BASE )
			.persist()
			.get( `/wpcom/v2/sites/${ mockSiteId }/activity` )
			.query( ( query ) => {
				queries.push( query );
				return true;
			} )
			.reply( 200, {
				current: {
					orderedItems: [
						{
							activity_id: '1',
							name: 'plugin__updated',
							summary: 'Plugin updated',
							published: '2025-01-01T12:00:00Z',
							content: { text: '', ranges: [] },
						},
					],
				},
				totalItems: 41,
				totalPages: 3,
			} );
		nock( API_BASE )
			.persist()
			.get( `/wpcom/v2/sites/${ mockSiteId }/activity/count/group` )
			.query( true )
			.reply( 200, { groups: {} } );
		window.history.replaceState( { key: 'logs-test', __TSR_index: 3 }, '', '/?keep=present' );
		const { router } = render( <SiteLogs logType={ LogType.ACTIVITY } siteSlug="test-site" /> );
		// Production registers an async navigation blocker, even when it allows the move.
		router.history.block( { blockerFn: async () => false, enableBeforeUnload: false } );
		await screen.findByText( 'Plugin updated' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Next page' } ) );
		await waitFor( () =>
			expect( ( router.state.location.search as Record< string, unknown > ).page ).toBe( 2 )
		);
		await userEvent.click( screen.getByRole( 'button', { name: /^Date range:/ } ) );
		await userEvent.click(
			within( await screen.findByRole( 'listbox', { name: 'Date range presets' } ) ).getByRole(
				'option',
				{ name: 'Last 7 days' }
			)
		);
		const today = Math.floor( Date.now() / 86400000 ) * 86400;
		await waitFor( () => {
			expect( router.state.location.search ).toMatchObject( {
				from: today - 6 * 86400,
				to: today + 86399,
				keep: 'present',
			} );
			expect( ( router.state.location.search as Record< string, unknown > ).page ).toBeUndefined();
			expect( new URLSearchParams( window.location.search ).get( 'from' ) ).toBe(
				String( today - 6 * 86400 )
			);
			expect( queries ).toContainEqual(
				expect.objectContaining( {
					page: '1',
					after: new Date( ( today - 6 * 86400 ) * 1000 ).toISOString(),
					before: new Date( ( today + 86399 ) * 1000 ).toISOString(),
				} )
			);
		} );
	} );

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
		mockPhpLogs( [] );
		const { router } = render( <SiteLogs logType={ LogType.PHP } siteSlug="test-site" /> );

		// Open the picker and explicitly choose preset which is auto-refresh compatible
		await userEvent.click( await screen.findByRole( 'button', { name: /^Date range:/ } ) );
		const listbox = await screen.findByRole( 'listbox', { name: 'Date range presets' } );
		await userEvent.click( within( listbox ).getByRole( 'option', { name: 'Last 7 days' } ) );

		const checkbox = screen.getByRole( 'checkbox', { name: 'Auto-refresh' } );
		await userEvent.click( checkbox );

		expect( checkbox ).toBeChecked();
		await waitFor( () => {
			expect(
				Number( ( router.state.location.search as Record< string, unknown > ).to )
			).toBeGreaterThanOrEqual( Math.floor( Date.now() / 1000 ) - 5 );
			expect(
				Number( ( router.state.location.search as Record< string, unknown > ).to )
			).toBeLessThanOrEqual( Math.floor( Date.now() / 1000 ) );
			expect( window.history.state.__TSR_index ).toBe( 3 );
		} );
		expect(
			screen.queryByText( 'Auto-refresh only works with "Last 7 days" preset' )
		).not.toBeInTheDocument();
	} );
} );

describe( '<SiteLogs> feature callouts', () => {
	test.each( [
		[ 'Access detailed logs', [] ],
		[ 'Activate hosting features', [ 'atomic', 'logs' ] ],
	] )( 'does not initialize dates behind the %s callout', async ( title, features ) => {
		mockSiteAndSettings( { features, isAtomic: false } );
		nock( API_BASE )
			.get( `/rest/v1/sites/${ mockSiteId }/automated-transfers/eligibility` )
			.reply( 200, { is_eligible: false, errors: [], warnings: {} } );
		const { router } = render( <SiteLogs logType={ LogType.PHP } siteSlug="test-site" /> );

		expect( within( await screen.findByRole( 'article' ) ).getByText( title ) ).toBeVisible();
		expect( router.state.location.search ).toEqual( {} );
		expect( window.location.search ).toBe( '' );
	} );
} );
