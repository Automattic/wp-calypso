/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { fetchLaunchpad } from '@automattic/launchpad';
import { QueryClient } from '@tanstack/react-query';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { prefetchHomeLayout } from 'calypso/data/home/use-home-layout-query';
import { getLoggedInLandingPage } from 'calypso/lib/landing-page';
import { canCurrentUserUseCustomerHome } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { maybeRedirect, redirectToLandingPage } from '../controller';

jest.mock( 'calypso/lib/landing-page', () => ( {
	...jest.requireActual( 'calypso/lib/landing-page' ),
	getLoggedInLandingPage: jest.fn(),
} ) );

jest.mock( '@automattic/launchpad', () => ( {
	...jest.requireActual( '@automattic/launchpad' ),
	fetchLaunchpad: jest.fn(),
} ) );

jest.mock( 'calypso/data/home/use-home-layout-query', () => ( {
	...jest.requireActual( 'calypso/data/home/use-home-layout-query' ),
	prefetchHomeLayout: jest.fn( () => Promise.resolve( { primary: [] } ) ),
} ) );

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	getAiLaunchpadStatus: jest.fn( () => null ),
} ) );

jest.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: jest.fn( () => ( { type: 'SITE_REQUEST' } ) ),
} ) );

jest.mock( 'calypso/state/sites/plans/selectors/is-site-big-sky-trial', () =>
	jest.fn( () => false )
);

jest.mock( 'calypso/state/sites/selectors', () => ( {
	canCurrentUserUseCustomerHome: jest.fn( () => true ),
	getSiteAdminUrl: jest.fn( () => 'https://example.wordpress.com/wp-admin/index.php' ),
	getSiteUrl: jest.fn( () => 'https://example.wordpress.com' ),
} ) );

jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: jest.fn( () => ( { ID: 1, launch_status: 'launched' } ) ),
	getSelectedSiteId: jest.fn( () => 1 ),
	getSelectedSiteSlug: jest.fn( () => 'test.wordpress.com' ),
} ) );

jest.mock( 'calypso/utils', () => ( {
	redirectToLaunchpad: jest.fn(),
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
		redirect = jest.spyOn( page, 'redirect' ).mockImplementation( () => {} );
		// Neutralize the timer `page.redirect` schedules, so a leaked navigation
		// cannot tear down the jsdom document while promises flush.
		jest.spyOn( page, 'replace' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'sends a multi-site Customer Home account to their primary site', async () => {
		getLoggedInLandingPage.mockResolvedValue( '/home/test.wordpress.com' );
		const next = jest.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( redirect ).toHaveBeenCalledWith( '/home/test.wordpress.com' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'honors the sites-as-landing-page preference', async () => {
		getLoggedInLandingPage.mockResolvedValue( '/sites' );
		const next = jest.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( redirect ).toHaveBeenCalledWith( '/sites' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'sends an absolute hosting-dashboard destination through a full page load', async () => {
		const destination = 'https://my.wordpress.com/sites';
		getLoggedInLandingPage.mockResolvedValue( destination );
		const assign = jest.fn();
		Object.defineProperty( window, 'location', { value: { assign }, configurable: true } );
		const next = jest.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( assign ).toHaveBeenCalledWith( destination );
		expect( redirect ).not.toHaveBeenCalled();
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'carries the querystring across to an absolute destination', async () => {
		getLoggedInLandingPage.mockResolvedValue( 'https://my.wordpress.com/sites' );
		const assign = jest.fn();
		Object.defineProperty( window, 'location', { value: { assign }, configurable: true } );
		const next = jest.fn();

		redirectToLandingPage( buildContext( { querystring: 'verified=1' } ), next );
		await flushPromises();

		expect( assign ).toHaveBeenCalledWith( 'https://my.wordpress.com/sites?verified=1' );
	} );

	it( 'carries the querystring across to the resolved destination', async () => {
		getLoggedInLandingPage.mockResolvedValue( '/home/test.wordpress.com' );
		const next = jest.fn();

		redirectToLandingPage( buildContext( { querystring: 'verified=1' } ), next );
		await flushPromises();

		expect( redirect ).toHaveBeenCalledWith( '/home/test.wordpress.com?verified=1' );
	} );

	it( 'falls through to the site picker when the resolver produces nothing usable', async () => {
		getLoggedInLandingPage.mockResolvedValue( undefined );
		const next = jest.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( next ).toHaveBeenCalled();
		expect( redirect ).not.toHaveBeenCalled();
	} );

	it( 'falls through to the site picker when the resolver throws', async () => {
		getLoggedInLandingPage.mockRejectedValue( new Error( 'resolver failed' ) );
		const next = jest.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( next ).toHaveBeenCalled();
		expect( redirect ).not.toHaveBeenCalled();
	} );

	it( 'falls through rather than redirecting to the route it is already on', async () => {
		getLoggedInLandingPage.mockResolvedValue( '/home' );
		const next = jest.fn();

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
		jest.clearAllMocks();
		canCurrentUserUseCustomerHome.mockReturnValue( true );
		jest.spyOn( page, 'redirect' ).mockImplementation( () => {} );
		jest.spyOn( page, 'replace' ).mockImplementation( () => {} );
		Object.defineProperty( window, 'location', {
			value: { assign: jest.fn(), replace: jest.fn() },
			writable: true,
			configurable: true,
		} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
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
		const next = jest.fn();

		await maybeRedirect( buildSiteContext(), next );

		expect( window.location.replace ).toHaveBeenCalledWith(
			'https://example.wordpress.com/wp-admin/index.php'
		);
		expect( fetchLaunchpad ).not.toHaveBeenCalled();
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'sends sites with enabled+dismissed to the wp-admin dashboard', async () => {
		getSelectedSite.mockReturnValueOnce( {
			ID: 1,
			launch_status: 'unlaunched',
			capabilities: { manage_options: true },
			options: { wpcom_ai_launchpad_enabled: true, wpcom_ai_launchpad_dismissed: true },
		} );
		const next = jest.fn();

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
		const next = jest.fn();

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
		const next = jest.fn();

		await maybeRedirect( buildSiteContext(), next );

		expect( window.location.replace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );

	it( 'renders the page when the launchpad request fails', async () => {
		fetchLaunchpad.mockRejectedValue( new Error( 'network' ) );
		const next = jest.fn();

		await maybeRedirect( buildSiteContext(), next );
		await flushPromises();

		expect( next ).toHaveBeenCalled();
	} );

	it( 'requests the card layout from the route rather than leaving it to the cards', async () => {
		fetchLaunchpad.mockResolvedValue( { launchpad_screen: 'off' } );
		const next = jest.fn();

		await maybeRedirect( buildSiteContext(), next );
		await flushPromises();

		expect( prefetchHomeLayout ).toHaveBeenCalledWith( expect.anything(), 1, expect.any( Object ) );
		expect( next ).toHaveBeenCalled();
	} );

	it( 'still renders the page when the card layout request fails', async () => {
		fetchLaunchpad.mockResolvedValue( { launchpad_screen: 'off' } );
		prefetchHomeLayout.mockRejectedValueOnce( new Error( 'network' ) );
		const next = jest.fn();

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
		const next = jest.fn();

		await maybeRedirect( buildSiteContext(), next );
		await flushPromises();

		expect( next ).not.toHaveBeenCalled();
	} );
} );
