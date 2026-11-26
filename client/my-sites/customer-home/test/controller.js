/**
 * @vitest-environment jsdom
 */

import { getAiLaunchpadStatus } from '@automattic/api-core';
import page from '@automattic/calypso-router';
import { fetchLaunchpad } from '@automattic/launchpad';
import { QueryClient } from '@tanstack/react-query';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { vi } from 'vitest';
import { prefetchHomeLayout } from 'calypso/data/home/use-home-layout-query';
import { getLoggedInLandingPage } from 'calypso/lib/landing-page';
import { canCurrentUserUseCustomerHome } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { maybeRedirect, redirectToLandingPage } from '../controller';

vi.mock( 'calypso/lib/landing-page', async () => ( {
	...( await vi.importActual( 'calypso/lib/landing-page' ) ),
	getLoggedInLandingPage: vi.fn(),
} ) );

vi.mock( '@automattic/launchpad', async () => ( {
	...( await vi.importActual( '@automattic/launchpad' ) ),
	fetchLaunchpad: vi.fn(),
} ) );

vi.mock( 'calypso/data/home/use-home-layout-query', async () => ( {
	...( await vi.importActual( 'calypso/data/home/use-home-layout-query' ) ),
	prefetchHomeLayout: vi.fn( () => Promise.resolve( { primary: [] } ) ),
} ) );

vi.mock( '@automattic/api-core', async () => ( {
	...( await vi.importActual( '@automattic/api-core' ) ),
	getAiLaunchpadStatus: vi.fn( () => null ),
} ) );

vi.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: vi.fn( () => ( { type: 'SITE_REQUEST' } ) ),
} ) );

vi.mock( 'calypso/state/sites/plans/selectors/is-site-big-sky-trial', () => ( {
	default: vi.fn( () => false ),
} ) );

vi.mock( 'calypso/state/sites/selectors', () => ( {
	canCurrentUserUseCustomerHome: vi.fn( () => true ),
	getSiteAdminUrl: vi.fn( () => 'https://example.wordpress.com/wp-admin/index.php' ),
	getSiteUrl: vi.fn( () => 'https://example.wordpress.com' ),
} ) );

vi.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: vi.fn( () => ( { ID: 1, launch_status: 'launched' } ) ),
	getSelectedSiteId: vi.fn( () => 1 ),
	getSelectedSiteSlug: vi.fn( () => 'test.wordpress.com' ),
} ) );

vi.mock( 'calypso/utils', () => ( {
	redirectToLaunchpad: vi.fn(),
} ) );

const mockStore = configureStore( [ thunk ] );

// Flush only the microtask queue, never a macrotask: `page.redirect` schedules its
// real `page.replace` on a timer, which would tear down the jsdom document.
const flushPromises = async () => {
	for ( let i = 0; i < 10; i++ ) {
		await Promise.resolve();
	}
};

const buildContext = ( { querystring = '' } = {} ) => ( {
	store: mockStore( {
		currentUser: { id: 1, user: { primary_blog: 1, site_count: 3, visible_site_count: 3 } },
		sites: { items: {} },
		ui: {},
	} ),
	path: '/home',
	pathname: '/home',
	querystring,
	query: {},
	params: {},
} );

describe( 'redirectToLandingPage', () => {
	let redirect;

	beforeEach( () => {
		redirect = vi.spyOn( page, 'redirect' ).mockImplementation( () => {} );
		// Neutralize the timer `page.redirect` schedules, so a leaked navigation
		// cannot tear down the jsdom document while promises flush.
		vi.spyOn( page, 'replace' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'sends a multi-site Customer Home account to their primary site', async () => {
		getLoggedInLandingPage.mockResolvedValue( '/home/test.wordpress.com' );
		const next = vi.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( redirect ).toHaveBeenCalledWith( '/home/test.wordpress.com' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'honors the sites-as-landing-page preference', async () => {
		getLoggedInLandingPage.mockResolvedValue( '/sites' );
		const next = vi.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( redirect ).toHaveBeenCalledWith( '/sites' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'sends an absolute hosting-dashboard destination through a full page load', async () => {
		const destination = 'https://my.wordpress.com/sites';
		getLoggedInLandingPage.mockResolvedValue( destination );
		const assign = vi.fn();
		Object.defineProperty( window, 'location', { value: { assign }, configurable: true } );
		const next = vi.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( assign ).toHaveBeenCalledWith( destination );
		expect( redirect ).not.toHaveBeenCalled();
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'carries the querystring across to an absolute destination', async () => {
		getLoggedInLandingPage.mockResolvedValue( 'https://my.wordpress.com/sites' );
		const assign = vi.fn();
		Object.defineProperty( window, 'location', { value: { assign }, configurable: true } );
		const next = vi.fn();

		redirectToLandingPage( buildContext( { querystring: 'verified=1' } ), next );
		await flushPromises();

		expect( assign ).toHaveBeenCalledWith( 'https://my.wordpress.com/sites?verified=1' );
	} );

	it( 'carries the querystring across to the resolved destination', async () => {
		getLoggedInLandingPage.mockResolvedValue( '/home/test.wordpress.com' );
		const next = vi.fn();

		redirectToLandingPage( buildContext( { querystring: 'verified=1' } ), next );
		await flushPromises();

		expect( redirect ).toHaveBeenCalledWith( '/home/test.wordpress.com?verified=1' );
	} );

	it( 'falls through to the site picker when the resolver produces nothing usable', async () => {
		getLoggedInLandingPage.mockResolvedValue( undefined );
		const next = vi.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( next ).toHaveBeenCalled();
		expect( redirect ).not.toHaveBeenCalled();
	} );

	it( 'falls through to the site picker when the resolver throws', async () => {
		getLoggedInLandingPage.mockRejectedValue( new Error( 'resolver failed' ) );
		const next = vi.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( next ).toHaveBeenCalled();
		expect( redirect ).not.toHaveBeenCalled();
	} );

	it( 'falls through rather than redirecting to the route it is already on', async () => {
		getLoggedInLandingPage.mockResolvedValue( '/home' );
		const next = vi.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( next ).toHaveBeenCalled();
		expect( redirect ).not.toHaveBeenCalled();
	} );
} );

describe( 'maybeRedirect', () => {
	const buildSiteContext = () => ( {
		...buildContext(),
		path: '/home/test.wordpress.com',
		pathname: '/home/test.wordpress.com',
		params: { site: 'test.wordpress.com' },
		queryClient: new QueryClient(),
	} );

	const originalLocation = window.location;

	beforeEach( () => {
		vi.clearAllMocks();
		canCurrentUserUseCustomerHome.mockReturnValue( true );
		vi.spyOn( page, 'redirect' ).mockImplementation( () => {} );
		vi.spyOn( page, 'replace' ).mockImplementation( () => {} );
		Object.defineProperty( window, 'location', {
			value: { assign: vi.fn(), replace: vi.fn() },
			writable: true,
			configurable: true,
		} );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
			configurable: true,
		} );
	} );

	it( 'sends no-guidance sites to the wp-admin dashboard', async () => {
		getSelectedSite.mockReturnValueOnce( {
			ID: 1,
			launch_status: 'unlaunched',
			capabilities: { manage_options: true },
			options: { wpcom_ai_launchpad_no_guidance: true },
		} );
		const next = vi.fn();

		await maybeRedirect( buildSiteContext(), next );

		expect( window.location.replace ).toHaveBeenCalledWith(
			'https://example.wordpress.com/wp-admin/index.php'
		);
		expect( fetchLaunchpad ).not.toHaveBeenCalled();
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'keeps the launch celebration when sending a site to the wp-admin dashboard', async () => {
		window.location.href = 'https://wordpress.com/home/test.wordpress.com?celebrateLaunch=true';
		getSelectedSite.mockReturnValueOnce( {
			ID: 1,
			launch_status: 'launched',
			capabilities: { manage_options: true },
			options: { wpcom_ai_launchpad_no_guidance: true },
		} );

		await maybeRedirect( buildSiteContext(), vi.fn() );

		expect( window.location.replace ).toHaveBeenCalledWith(
			'https://example.wordpress.com/wp-admin/index.php?celebrate-launch=true'
		);
	} );

	it.each( [
		[ 'no-guidance', { wpcom_ai_launchpad_no_guidance: true } ],
		[ 'active AI Launchpad', { wpcom_ai_launchpad_enabled: true } ],
	] )( 'keeps %s sites on My Home with legacyHome=1', async ( _, options ) => {
		window.location.href = 'https://wordpress.com/home/test.wordpress.com?legacyHome=1';
		fetchLaunchpad.mockResolvedValue( { launchpad_screen: 'off' } );
		getAiLaunchpadStatus.mockReturnValueOnce(
			options.wpcom_ai_launchpad_enabled ? 'active' : null
		);
		getSelectedSite.mockReturnValueOnce( {
			ID: 1,
			launch_status: 'unlaunched',
			capabilities: { manage_options: true },
			options,
		} );
		const next = vi.fn();

		await maybeRedirect( buildSiteContext(), next );

		expect( window.location.replace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );

	it( 'sends sites with enabled+dismissed to the wp-admin dashboard', async () => {
		getSelectedSite.mockReturnValueOnce( {
			ID: 1,
			launch_status: 'unlaunched',
			capabilities: { manage_options: true },
			options: { wpcom_ai_launchpad_enabled: true, wpcom_ai_launchpad_dismissed: true },
		} );
		const next = vi.fn();

		await maybeRedirect( buildSiteContext(), next );

		expect( window.location.replace ).toHaveBeenCalledWith(
			'https://example.wordpress.com/wp-admin/index.php'
		);
		expect( fetchLaunchpad ).not.toHaveBeenCalled();
		expect( next ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'no-guidance', { wpcom_ai_launchpad_no_guidance: true } ],
		[ 'AI Launchpad', { wpcom_ai_launchpad_enabled: true } ],
	] )( 'sends non-admins of %s sites to the wp-admin dashboard', async ( _, options ) => {
		getSelectedSite.mockReturnValueOnce( {
			ID: 1,
			launch_status: 'unlaunched',
			capabilities: { manage_options: false },
			options,
		} );
		const next = vi.fn();

		await maybeRedirect( buildSiteContext(), next );

		expect( window.location.replace ).toHaveBeenCalledWith(
			'https://example.wordpress.com/wp-admin/index.php'
		);
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'keeps non-admins of legacy launchpad sites on My Home', async () => {
		getSelectedSite.mockReturnValueOnce( {
			ID: 1,
			launch_status: 'unlaunched',
			capabilities: { manage_options: false },
			options: {},
		} );
		fetchLaunchpad.mockResolvedValue( { launchpad_screen: 'off' } );
		const next = vi.fn();

		await maybeRedirect( buildSiteContext(), next );

		expect( window.location.replace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );

	it( 'renders the page when the launchpad request fails', async () => {
		fetchLaunchpad.mockRejectedValue( new Error( 'network' ) );
		const next = vi.fn();

		await maybeRedirect( buildSiteContext(), next );
		await flushPromises();

		expect( next ).toHaveBeenCalled();
	} );

	it( 'requests the card layout from the route rather than leaving it to the cards', async () => {
		fetchLaunchpad.mockResolvedValue( { launchpad_screen: 'off' } );
		const next = vi.fn();

		await maybeRedirect( buildSiteContext(), next );
		await flushPromises();

		expect( prefetchHomeLayout ).toHaveBeenCalledWith( expect.anything(), 1, expect.any( Object ) );
		expect( next ).toHaveBeenCalled();
	} );

	it( 'still renders the page when the card layout request fails', async () => {
		fetchLaunchpad.mockResolvedValue( { launchpad_screen: 'off' } );
		prefetchHomeLayout.mockRejectedValueOnce( new Error( 'network' ) );
		const next = vi.fn();

		await maybeRedirect( buildSiteContext(), next );
		await flushPromises();

		expect( next ).toHaveBeenCalled();
	} );

	it( 'redirects to the launchpad when the checklist is unfinished', async () => {
		fetchLaunchpad.mockResolvedValue( {
			launchpad_screen: 'full',
			site_intent: 'build',
			checklist: [ { id: 'a', completed: false } ],
		} );
		const next = vi.fn();

		await maybeRedirect( buildSiteContext(), next );
		await flushPromises();

		expect( next ).not.toHaveBeenCalled();
	} );
} );
