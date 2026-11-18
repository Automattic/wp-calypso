/**
 * @vitest-environment jsdom
 */
import { siteScanHistoryQuery, siteScanQuery } from '@automattic/api-queries';
import { act, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { ScanContent } from '../scan-content';
import type { Site, SiteScan, Threat } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const site = { ID: 1, slug: 'test-site.wordpress.com' } as Site;

const activeThreat = {
	id: 11,
	signature: 'Vulnerable.WP.Extension',
	title: 'Vulnerable plugin: Example',
	description: 'The plugin has a known vulnerability.',
	first_detected: '2026-10-01T10:00:00.000Z',
	severity: 4,
	status: 'current',
} as Threat;

const fixedThreat = {
	...activeThreat,
	id: 12,
	status: 'fixed',
	fixed_on: '2026-10-02T10:00:00.000Z',
} as Threat;

function getScan( threats: Threat[] ): SiteScan {
	return {
		state: 'idle',
		threats,
		has_cloud: true,
		current: { is_initial: false, timestamp: '2026-10-03T10:00:00.000Z', progress: 100 },
		most_recent: {
			is_initial: false,
			timestamp: '2026-10-03T10:00:00.000Z',
			duration: 10,
			progress: 100,
			error: false,
		},
	} as unknown as SiteScan;
}

function mockPreferences( preferences: Record< string, unknown > = {} ) {
	nock( API )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: preferences } );
}

function mockScan( threats: Threat[] ) {
	nock( API ).persist().get( `/wpcom/v2/sites/${ site.ID }/scan` ).reply( 200, getScan( threats ) );
}

function mockScanHistory( threats: Threat[] ) {
	nock( API ).get( `/wpcom/v2/sites/${ site.ID }/scan/history` ).reply( 200, { threats } );
}

describe( '<ScanContent>', () => {
	afterEach( () => {
		window.history.replaceState( null, '', '/' );
	} );

	describe( 'active threats', () => {
		test( 'lists the threats with the toolbar', async () => {
			mockPreferences();
			mockScan( [ activeThreat ] );
			render( <ScanContent site={ site } scanTab="active" /> );

			expect( await screen.findByRole( 'table' ) ).toBeVisible();
			expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Scan now' } ) ).toBeVisible();
			expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();
		} );

		test( 'replaces the list when the scan found nothing, and keeps Scan now', async () => {
			mockPreferences();
			mockScan( [] );
			render( <ScanContent site={ site } scanTab="active" /> );

			expect( await screen.findByRole( 'heading', { name: 'No threats found' } ) ).toBeVisible();
			expect( screen.getByText( 'New threats will appear here after each scan.' ) ).toBeVisible();
			expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Scan now' } ) ).toBeVisible();
		} );

		test( 'treats a saved view with an empty filter list as not filtered', async () => {
			mockPreferences( {
				'hosting-dashboard-dataviews-view-site-scan-active': { type: 'table', filters: [] },
			} );
			mockScan( [] );
			render( <ScanContent site={ site } scanTab="active" /> );

			expect( await screen.findByRole( 'heading', { name: 'No threats found' } ) ).toBeVisible();
			expect( screen.queryByText( 'No threats match your filters' ) ).not.toBeInTheDocument();
		} );

		test( 'keeps the toolbar when a search finds nothing', async () => {
			mockPreferences();
			mockScan( [] );
			window.history.replaceState( null, '', '/?search=nothing' );
			render( <ScanContent site={ site } scanTab="active" /> );

			expect(
				await screen.findByRole( 'heading', { name: 'No threats match your search' } )
			).toBeVisible();
			expect( screen.getByText( 'Try a different search term.' ) ).toBeVisible();
			expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
		} );

		test( 'keeps the toolbar when the filters find nothing', async () => {
			mockPreferences( {
				'hosting-dashboard-dataviews-view-site-scan-active': {
					type: 'table',
					filters: [ { field: 'severity', operator: 'isAny', value: [ 'none' ] } ],
				},
			} );
			mockScan( [] );
			render( <ScanContent site={ site } scanTab="active" /> );

			expect(
				await screen.findByRole( 'heading', { name: 'No threats match your filters' } )
			).toBeVisible();
			expect( screen.getByText( 'Try different filters, or reset them.' ) ).toBeVisible();
			expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
		} );

		test( 'shows the search message when a search and a filter are both set', async () => {
			mockPreferences( {
				'hosting-dashboard-dataviews-view-site-scan-active': {
					type: 'table',
					filters: [ { field: 'severity', operator: 'isAny', value: [ 'none' ] } ],
				},
			} );
			mockScan( [] );
			window.history.replaceState( null, '', '/?search=nothing' );
			render( <ScanContent site={ site } scanTab="active" /> );

			expect(
				await screen.findByRole( 'heading', { name: 'No threats match your search' } )
			).toBeVisible();
		} );

		test( 'keeps the empty state when a later refetch fails', async () => {
			mockPreferences();
			mockScan( [] );
			const { queryClient } = render( <ScanContent site={ site } scanTab="active" /> );
			expect( await screen.findByRole( 'heading', { name: 'No threats found' } ) ).toBeVisible();

			nock.cleanAll();
			mockPreferences();
			nock( API )
				.persist()
				.get( `/wpcom/v2/sites/${ site.ID }/scan` )
				.reply( 500, { error: 'server_error' } );
			await act( () => queryClient.invalidateQueries( siteScanQuery( site.ID ) ) );
			await waitFor( () =>
				expect( queryClient.getQueryState( siteScanQuery( site.ID ).queryKey )?.status ).toBe(
					'error'
				)
			);

			expect( screen.getByRole( 'heading', { name: 'No threats found' } ) ).toBeVisible();
			expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'No results' ) ).not.toBeInTheDocument();
		} );

		test( 'does not show an empty state while the scan loads', async () => {
			let respond: () => void = () => {};
			const response = new Promise< void >( ( resolve ) => {
				respond = resolve;
			} );
			mockPreferences();
			nock( API )
				.persist()
				.get( `/wpcom/v2/sites/${ site.ID }/scan` )
				.reply( async () => {
					await response;
					return [ 200, getScan( [] ) ];
				} );
			render( <ScanContent site={ site } scanTab="active" /> );

			expect( await screen.findByRole( 'searchbox' ) ).toBeVisible();
			expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();

			respond();
			expect( await screen.findByRole( 'heading', { name: 'No threats found' } ) ).toBeVisible();
		} );

		test( 'does not show an empty state when the scan fails to load', async () => {
			mockPreferences();
			nock( API )
				.persist()
				.get( `/wpcom/v2/sites/${ site.ID }/scan` )
				.reply( 500, { error: 'server_error' } );
			render( <ScanContent site={ site } scanTab="active" /> );

			expect( await screen.findByText( 'No results' ) ).toBeVisible();
			expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
			expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'history', () => {
		test( 'lists the archived threats with the toolbar', async () => {
			mockPreferences();
			mockScan( [] );
			mockScanHistory( [ fixedThreat ] );
			render( <ScanContent site={ site } scanTab="history" /> );

			expect( await screen.findByRole( 'table' ) ).toBeVisible();
			expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
			expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();
		} );

		test( 'replaces the list when there is no history, and keeps Scan now', async () => {
			mockPreferences();
			mockScan( [] );
			mockScanHistory( [] );
			render( <ScanContent site={ site } scanTab="history" /> );

			expect( await screen.findByRole( 'heading', { name: 'No history yet' } ) ).toBeVisible();
			expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Scan now' } ) ).toBeVisible();
		} );

		test( 'treats a saved view with an empty filter list as not filtered', async () => {
			mockPreferences( {
				'hosting-dashboard-dataviews-view-site-scan-history': { type: 'table', filters: [] },
			} );
			mockScan( [] );
			mockScanHistory( [] );
			render( <ScanContent site={ site } scanTab="history" /> );

			expect( await screen.findByRole( 'heading', { name: 'No history yet' } ) ).toBeVisible();
			expect( screen.queryByText( 'No threats match your filters' ) ).not.toBeInTheDocument();
		} );

		test( 'keeps the toolbar when a search finds nothing', async () => {
			mockPreferences();
			mockScan( [] );
			mockScanHistory( [ fixedThreat ] );
			window.history.replaceState( null, '', '/?search=nothing' );
			render( <ScanContent site={ site } scanTab="history" /> );

			expect(
				await screen.findByRole( 'heading', { name: 'No threats match your search' } )
			).toBeVisible();
			expect( screen.getByText( 'Try a different search term.' ) ).toBeVisible();
			expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
		} );

		test( 'says what the history will hold', async () => {
			mockPreferences();
			mockScan( [] );
			mockScanHistory( [] );
			render( <ScanContent site={ site } scanTab="history" /> );

			expect(
				await screen.findByText( 'Fixed and ignored threats will appear here.' )
			).toBeVisible();
		} );

		test( 'keeps the empty state when a later refetch fails', async () => {
			mockPreferences();
			mockScan( [] );
			mockScanHistory( [] );
			const { queryClient } = render( <ScanContent site={ site } scanTab="history" /> );
			expect( await screen.findByRole( 'heading', { name: 'No history yet' } ) ).toBeVisible();

			nock.cleanAll();
			mockPreferences();
			mockScan( [] );
			nock( API )
				.get( `/wpcom/v2/sites/${ site.ID }/scan/history` )
				.reply( 500, { error: 'server_error' } );
			await act( () => queryClient.invalidateQueries( siteScanHistoryQuery( site.ID ) ) );
			await waitFor( () =>
				expect(
					queryClient.getQueryState( siteScanHistoryQuery( site.ID ).queryKey )?.status
				).toBe( 'error' )
			);

			expect( screen.getByRole( 'heading', { name: 'No history yet' } ) ).toBeVisible();
			expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
		} );

		test( 'does not show an empty state when the history fails to load', async () => {
			mockPreferences();
			mockScan( [] );
			nock( API )
				.get( `/wpcom/v2/sites/${ site.ID }/scan/history` )
				.reply( 500, { error: 'server_error' } );
			render( <ScanContent site={ site } scanTab="history" /> );

			expect( await screen.findByText( 'No results' ) ).toBeVisible();
			expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();
		} );

		test( 'does not show an empty state while the history loads', async () => {
			let respond: () => void = () => {};
			const response = new Promise< void >( ( resolve ) => {
				respond = resolve;
			} );
			mockPreferences();
			mockScan( [] );
			nock( API )
				.get( `/wpcom/v2/sites/${ site.ID }/scan/history` )
				.reply( async () => {
					await response;
					return [ 200, { threats: [] } ];
				} );
			render( <ScanContent site={ site } scanTab="history" /> );

			expect( await screen.findByRole( 'searchbox' ) ).toBeVisible();
			expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();

			respond();
			expect( await screen.findByRole( 'heading', { name: 'No history yet' } ) ).toBeVisible();
		} );
	} );
} );
