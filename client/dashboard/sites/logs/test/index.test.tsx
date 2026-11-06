/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { LogType } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	Outlet,
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	useParams,
} from '@tanstack/react-router';
import {
	act,
	render as testingLibraryRender,
	screen,
	within,
	waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import nock from 'nock';
import { Suspense } from 'react';
import { AnalyticsProvider } from '../../../app/analytics';
import { AuthContext } from '../../../app/auth';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { render } from '../../../test-utils';
import SiteLogs from '../index';
import type { User } from '@automattic/api-core';

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
	slug = 'test-site',
	siteId = mockSiteId,
	inaccessibleJetpack = false,
}: {
	gmtOffset?: number;
	timezoneString?: string;
	features?: string[];
	isAtomic?: boolean;
	slug?: string;
	siteId?: number;
	inaccessibleJetpack?: boolean;
} = {} ) {
	if ( inaccessibleJetpack ) {
		nock( API_BASE )
			.get( `/rest/v1.1/sites/${ slug }` )
			.query( ( query ) => query.force !== 'wpcom' )
			.reply( 403, { error: 'unauthorized', message: 'The Jetpack site is inaccessible.' } );
	}
	nock( API_BASE )
		.get( `/rest/v1.1/sites/${ slug }` )
		.query( true )
		.reply( 200, {
			ID: siteId,
			slug,
			options: { admin_url: 'https://example.com/wp-admin/' },
			is_wpcom_atomic: isAtomic,
			plan: { features: { active: features } },
		} );
	nock( API_BASE )
		.get( `/rest/v1.4/sites/${ siteId }/settings` )
		.reply( 200, { settings: { gmt_offset: gmtOffset, timezone_string: timezoneString } } );
}

function mockPhpLogs( logs: unknown[], siteId = mockSiteId ) {
	const queries: Record< string, unknown >[] = [];
	nock( API_BASE )
		.persist()
		.get( `/wpcom/v2/sites/${ siteId }/hosting/error-logs` )
		.query( true )
		// Recorded on reply: nock runs query matchers before it compares the path.
		.reply( 200, ( uri ) => {
			queries.push( Object.fromEntries( new URL( uri, API_BASE ).searchParams ) );
			return { data: { total_results: logs.length, logs, scroll_id: null } };
		} );
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

	test( 'clears the auto-refresh warning when history restores the Last 7 days range', async () => {
		mockPhpLogs( [] );
		const { router } = render( <SiteLogs logType={ LogType.PHP } siteSlug="test-site" /> );
		const warning = 'Auto-refresh only works with "Last 7 days" preset';
		const picker = () => screen.getByRole( 'button', { name: /^Date range:/ } );
		const checkbox = await screen.findByRole( 'checkbox', { name: 'Auto-refresh' } );
		await userEvent.click( checkbox );
		await waitFor( () =>
			expect(
				Number( ( router.state.location.search as Record< string, unknown > ).to )
			).toBeLessThanOrEqual( Math.floor( Date.now() / 1000 ) )
		);
		const liveSearch = router.state.location.search;
		const liveLabel = picker().getAttribute( 'aria-label' );

		// Like following the active sidebar link, which drops the dates.
		await act( () => router.navigate( { to: '/', search: {} } ) );
		await userEvent.click( picker() );
		await userEvent.click( screen.getByRole( 'option', { name: 'Yesterday' } ) );
		expect( await screen.findByText( warning ) ).toBeVisible();
		expect( checkbox ).not.toBeChecked();
		expect( checkbox ).toBeDisabled();

		await act( async () => router.history.back() );
		await waitFor( () => expect( router.state.location.search ).toEqual( liveSearch ) );
		expect( picker() ).toHaveAttribute( 'aria-label', liveLabel );
		expect( screen.queryByText( warning ) ).not.toBeInTheDocument();
		expect( checkbox ).toBeEnabled();

		await act( async () => router.history.forward() );
		await waitFor( () => expect( picker() ).not.toHaveAttribute( 'aria-label', liveLabel ) );
		expect( screen.queryByText( warning ) ).not.toBeInTheDocument();
		await userEvent.click( checkbox );
		expect( checkbox ).not.toBeChecked();
		expect( await screen.findByText( warning ) ).toBeVisible();
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

describe( '<SiteLogs> live site calendar ranges', () => {
	afterEach( () => {
		jest.useRealTimers();
		MockDate.reset();
	} );

	test.each< {
		name: string;
		timezoneString?: string;
		gmtOffset?: number;
		now: string;
		start: string;
		startAfterTick?: string;
		firstDay: string;
	} >( [
		{
			name: 'New York spring forward',
			timezoneString: 'America/New_York',
			now: '2025-03-10T04:30:00Z',
			start: '2025-03-04T05:30:00Z',
			firstDay: 'Mar 4, 2025',
		},
		{
			name: 'New York fall back',
			timezoneString: 'America/New_York',
			now: '2025-11-03T05:30:00Z',
			start: '2025-10-28T04:30:00Z',
			firstDay: 'Oct 28, 2025',
		},
		{
			name: 'the spring-forward clock change',
			timezoneString: 'America/New_York',
			now: '2025-03-09T06:59:55Z',
			start: '2025-03-03T06:59:55Z',
			startAfterTick: '2025-03-03T08:00:05Z',
			firstDay: 'Mar 3, 2025',
		},
		{
			name: 'the fall-back clock change',
			timezoneString: 'America/New_York',
			now: '2025-11-02T05:59:55Z',
			start: '2025-10-27T05:59:55Z',
			startAfterTick: '2025-10-27T05:00:05Z',
			firstDay: 'Oct 27, 2025',
		},
		{
			name: 'Tokyo without site DST',
			timezoneString: 'Asia/Tokyo',
			now: '2025-03-10T04:30:00Z',
			start: '2025-03-04T04:30:00Z',
			firstDay: 'Mar 4, 2025',
		},
		{
			name: 'fixed fractional site offset',
			gmtOffset: 5.75,
			now: '2025-03-10T04:30:00Z',
			start: '2025-03-04T04:30:00Z',
			firstDay: 'Mar 4, 2025',
		},
	] )(
		'keeps refresh enabled across $name',
		async ( { now, start, startAfterTick, firstDay, ...settings } ) => {
			MockDate.set( now );
			mockSiteAndSettings( settings );
			const requests = mockPhpLogs( [] );
			window.history.replaceState( { __TSR_index: 3 }, '', '/?keep=present' );
			const { router } = render( <SiteLogs logType={ LogType.PHP } siteSlug="test-site" /> );
			const search = () => new URLSearchParams( router.state.location.searchStr );
			const checkbox = await screen.findByRole( 'checkbox', { name: 'Auto-refresh' } );
			await waitFor( () => expect( search().has( 'to' ) ).toBe( true ) );
			// Let the initial network/suspense work settle before controlling the refresh timer.
			jest.useFakeTimers( { now: Date.parse( now ), doNotFake: [ 'nextTick', 'setImmediate' ] } );
			const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
			const length = window.history.length;
			const index = window.history.state.__TSR_index;
			await user.click( checkbox );
			const assertLiveRange = async ( expectedStart: number, expectedEnd: number ) => {
				await waitFor( () => {
					const from = Number( search().get( 'from' ) );
					const to = Number( search().get( 'to' ) );
					expect( to ).toBeGreaterThanOrEqual( expectedEnd );
					// Literal site-clock bounds remain six calendar days apart as the timer advances.
					expect( from ).toBe( expectedStart + to - expectedEnd );
					expect( requests ).toContainEqual(
						expect.objectContaining( { start: String( from ), end: String( to ) } )
					);
				} );
				expect( checkbox ).toBeChecked();
				expect( screen.getByRole( 'button', { name: /^Date range:/ } ) ).toHaveAccessibleName(
					expect.stringContaining( firstDay )
				);
				expect(
					screen.queryByText( 'Auto-refresh only works with "Last 7 days" preset' )
				).not.toBeInTheDocument();
				expect( search().get( 'keep' ) ).toBe( 'present' );
				expect( window.history.state.__TSR_index ).toBe( index );
				expect( window.history.length ).toBe( length );
			};
			await assertLiveRange( Date.parse( start ) / 1000, Date.parse( now ) / 1000 );
			const previousEnd = Number( search().get( 'to' ) );
			await act( async () => jest.advanceTimersByTimeAsync( 10_000 ) );
			expect( Number( search().get( 'to' ) ) ).toBeGreaterThanOrEqual( previousEnd + 10 );
			await assertLiveRange(
				startAfterTick ? Date.parse( startAfterTick ) / 1000 : Date.parse( start ) / 1000 + 10,
				Date.parse( now ) / 1000 + 10
			);
		}
	);
} );

describe( '<SiteLogs> site calendar request bounds', () => {
	afterEach( () => MockDate.reset() );

	test.each( [
		{
			zone: 'America/New_York',
			now: '2025-01-03T12:00:00Z',
			firstDayLabel: 'Jan 1, 2025',
			after: '2025-01-01T05:00:00.000Z',
			before: '2025-01-03T04:59:59.000Z',
			selectedAfter: '2025-01-02T05:00:00.000Z',
			selectedBefore: '2025-01-03T04:59:59.000Z',
		},
		{
			zone: 'Asia/Tokyo',
			now: '2025-01-03T12:00:00Z',
			firstDayLabel: 'Jan 1, 2025',
			after: '2024-12-31T15:00:00.000Z',
			before: '2025-01-02T14:59:59.000Z',
			selectedAfter: '2025-01-01T15:00:00.000Z',
			selectedBefore: '2025-01-02T14:59:59.000Z',
		},
		{
			zone: 'America/New_York',
			now: '2025-03-10T12:00:00Z',
			firstDayLabel: 'Mar 8, 2025',
			after: '2025-03-08T05:00:00.000Z',
			before: '2025-03-10T03:59:59.000Z',
			selectedAfter: '2025-03-09T05:00:00.000Z',
			selectedBefore: '2025-03-10T03:59:59.000Z',
		},
	] )( 'keeps URL, picker and Activity requests aligned in $zone at $now', async ( bounds ) => {
		MockDate.set( bounds.now );
		mockSiteAndSettings( { timezoneString: bounds.zone } );
		window.history.replaceState(
			{ __TSR_index: 3 },
			'',
			`/?from=${ Date.parse( bounds.after ) / 1000 }&to=${ Date.parse( bounds.before ) / 1000 }`
		);
		const requests: Record< string, unknown >[] = [];
		nock( API_BASE )
			.persist()
			.get( `/wpcom/v2/sites/${ mockSiteId }/activity` )
			.query( ( query ) => {
				requests.push( query );
				return true;
			} )
			.reply( 200, { current: { orderedItems: [] }, totalItems: 0, totalPages: 0 } );
		nock( API_BASE )
			.persist()
			.get( `/wpcom/v2/sites/${ mockSiteId }/activity/count/group` )
			.query( true )
			.reply( 200, { groups: {} } );
		const { router } = render( <SiteLogs logType={ LogType.ACTIVITY } siteSlug="test-site" /> );
		await waitFor( () =>
			expect( requests ).toContainEqual(
				expect.objectContaining( {
					after: bounds.after,
					before: bounds.before,
				} )
			)
		);
		const picker = screen.getByRole( 'button', { name: /^Date range:/ } );
		expect( picker ).toHaveAccessibleName( expect.stringContaining( bounds.firstDayLabel ) );
		await userEvent.click( picker );
		await userEvent.click( screen.getByRole( 'option', { name: 'Yesterday' } ) );
		await waitFor( () =>
			expect( requests ).toContainEqual(
				expect.objectContaining( {
					after: bounds.selectedAfter,
					before: bounds.selectedBefore,
				} )
			)
		);
		expect( router.state.location.search ).toMatchObject( {
			from: Date.parse( bounds.selectedAfter ) / 1000,
			to: Date.parse( bounds.selectedBefore ) / 1000,
		} );
	} );
} );

describe( '<SiteLogs> site switches', () => {
	const now = Date.parse( '2025-03-10T04:30:00Z' ) / 1000;
	const today = Date.parse( '2025-03-10T00:00:00Z' ) / 1000;

	function SiteLogsRoute() {
		const { siteSlug } = useParams( { strict: false } ) as { siteSlug: string };
		return <SiteLogs logType={ LogType.PHP } siteSlug={ siteSlug } />;
	}

	// The shared render helper has no `$siteSlug` route; like production, this one stays
	// mounted while its params change.
	function renderAtSiteLogsUrl( url: string ) {
		const root = createRootRoute( {
			pendingMs: 0,
			component: () => (
				<Suspense fallback={ null }>
					<Outlet />
				</Suspense>
			),
		} );
		const logsRoute = createRoute( {
			getParentRoute: () => root,
			path: 'sites/$siteSlug/logs/php',
			component: SiteLogsRoute,
		} );
		const router = createRouter( {
			routeTree: root.addChildren( [ logsRoute ] ),
			history: createMemoryHistory( { initialEntries: [ url ] } ),
		} );
		testingLibraryRender(
			<QueryClientProvider
				client={ new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
			>
				<AppProvider config={ APP_CONTEXT_DEFAULT_CONFIG }>
					<AnalyticsProvider client={ { recordTracksEvent: jest.fn(), recordPageView: jest.fn() } }>
						<AuthContext.Provider value={ { user: { ID: 1 } as User, logout: jest.fn() } }>
							<RouterProvider router={ router } context={ { config: { basePath: '/' } } } />
						</AuthContext.Provider>
					</AnalyticsProvider>
				</AppProvider>
			</QueryClientProvider>
		);
		return router;
	}

	beforeEach( () => MockDate.set( now * 1000 ) );
	afterEach( () => MockDate.reset() );

	test.each( [
		[ 'reachable', false ],
		[ 'inaccessible Jetpack', true ],
	] )(
		'starts the next %s site with refresh off and its own range pinned',
		async ( _, inaccessibleJetpack ) => {
			mockSiteAndSettings( { inaccessibleJetpack } );
			mockSiteAndSettings( { slug: 'other-site', siteId: 456, inaccessibleJetpack } );
			mockPhpLogs( [] );
			const requests = mockPhpLogs( [], 456 );
			const router = renderAtSiteLogsUrl( '/sites/test-site/logs/php' );
			const search = () => new URLSearchParams( router.state.location.searchStr );
			await waitFor( () => expect( search().get( 'to' ) ).toBe( String( today + 86399 ) ) );
			await userEvent.click( await screen.findByRole( 'checkbox', { name: 'Auto-refresh' } ) );
			await waitFor( () => expect( search().get( 'to' ) ).toBe( String( now ) ) );

			await act( async () => router.history.push( '/sites/other-site/logs/php' ) );
			await waitFor( () => expect( requests ).not.toHaveLength( 0 ) );
			const checkbox = await screen.findByRole( 'checkbox', { name: 'Auto-refresh' } );
			expect( checkbox ).not.toBeChecked();
			await waitFor( () => expect( search().get( 'to' ) ).toBe( String( today + 86399 ) ) );
			expect( search().get( 'from' ) ).toBe( String( today - 6 * 86400 ) );

			await userEvent.click( checkbox );
			await waitFor( () =>
				expect( requests ).toContainEqual(
					expect.objectContaining( { start: String( now - 6 * 86400 ), end: String( now ) } )
				)
			);
			expect( checkbox ).toBeChecked();
			expect( search().get( 'to' ) ).toBe( String( now ) );
		}
	);

	test( 'starts over when the same site opens under its ID', async () => {
		mockSiteAndSettings();
		mockSiteAndSettings( { slug: String( mockSiteId ) } );
		mockPhpLogs( [] );
		const router = renderAtSiteLogsUrl( '/sites/test-site/logs/php' );
		const search = () => new URLSearchParams( router.state.location.searchStr );
		await userEvent.click( await screen.findByRole( 'checkbox', { name: 'Auto-refresh' } ) );
		await waitFor( () => expect( search().get( 'to' ) ).toBe( String( now ) ) );

		await act( async () => router.history.push( `/sites/${ mockSiteId }/logs/php` ) );
		await waitFor( () => expect( search().get( 'to' ) ).toBe( String( today + 86399 ) ) );
		expect( search().get( 'from' ) ).toBe( String( today - 6 * 86400 ) );
		expect( screen.getByRole( 'checkbox', { name: 'Auto-refresh' } ) ).not.toBeChecked();
	} );

	test( 'keeps the range restored for a site in another time zone', async () => {
		const from = Date.parse( '2025-01-31T15:00:00Z' ) / 1000;
		const to = Date.parse( '2025-02-07T14:59:59Z' ) / 1000;
		mockSiteAndSettings();
		mockSiteAndSettings( { slug: 'other-site', siteId: 456, timezoneString: 'Asia/Tokyo' } );
		const requests = mockPhpLogs( [] );
		mockPhpLogs( [], 456 );
		const router = renderAtSiteLogsUrl( `/sites/other-site/logs/php?from=${ from }&to=${ to }` );
		const search = () => new URLSearchParams( router.state.location.searchStr );
		const picker = () => screen.getByRole( 'button', { name: /^Date range:/ } );
		await waitFor( () =>
			expect( picker() ).toHaveAccessibleName( expect.stringContaining( 'Feb 1, 2025' ) )
		);

		await act( async () => router.history.push( '/sites/test-site/logs/php' ) );
		await waitFor( () => expect( requests ).not.toHaveLength( 0 ) );
		await userEvent.click( await screen.findByRole( 'checkbox', { name: 'Auto-refresh' } ) );
		await waitFor( () => expect( search().get( 'to' ) ).toBe( String( now ) ) );

		await act( async () => router.history.back() );
		await waitFor( () =>
			expect( router.state.location.pathname ).toBe( '/sites/other-site/logs/php' )
		);
		await waitFor( () =>
			expect( screen.getByRole( 'checkbox', { name: 'Auto-refresh' } ) ).not.toBeChecked()
		);
		expect( search().get( 'from' ) ).toBe( String( from ) );
		expect( search().get( 'to' ) ).toBe( String( to ) );
		await waitFor( () =>
			expect( picker() ).toHaveAccessibleName( expect.stringContaining( 'Feb 1, 2025' ) )
		);
	} );
} );
