/**
 * @vitest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { vi } from 'vitest';
import { redirectLoggedOutToSignup } from 'calypso/controller';
import { setupRedirectRoutes } from 'calypso/utils';
import initReader from '../index';
import { readerNotFound } from '../lib/reader-router';

vi.mock( '@automattic/calypso-router', () => {
	const page = Object.assign( vi.fn(), { redirect: vi.fn() } );
	return {
		__esModule: true,
		default: page,
	};
} );

vi.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: {
		isEnabled: vi.fn( () => false ),
	},
} ) );

vi.mock( '@automattic/i18n-utils', () => ( {
	getAnyLanguageRouteParam: () => ':lang([a-z]{2,3}|[a-z]{2}-[a-z]{2})',
	getLanguageRouteParam: () => ':lang(en|fr)?',
} ) );

vi.mock( 'redux-dynamic-middlewares', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		addMiddleware: vi.fn(),
	} )
);

vi.mock( 'calypso/controller', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		makeLayout: vi.fn(),
		redirectLoggedOut: vi.fn(),
		redirectLoggedOutToSignup: vi.fn(),
		render: vi.fn(),
		setSelectedSiteIdByOrigin: vi.fn(),
	} )
);

vi.mock( 'calypso/utils', () => ( {
	setupRedirectRoutes: vi.fn(),
} ) );

vi.mock( '../controller', () => ( {
	blogDiscoveryByFeedId: vi.fn(),
	blogListing: vi.fn(),
	commentSubscriptionsManager: vi.fn(),
	feedDiscovery: vi.fn(),
	feedListing: vi.fn(),
	feedLookup: vi.fn(),
	following: vi.fn(),
	loadNewSubscriptionPage: vi.fn(),
	pendingSubscriptionsManager: vi.fn(),
	readA8C: vi.fn(),
	readFollowingP2: vi.fn(),
	redirectLoggedOutToDiscover: vi.fn(),
	setupReadRoutes: vi.fn(),
	sidebar: vi.fn(),
	siteSubscription: vi.fn(),
	siteSubscriptionsManager: vi.fn(),
} ) );

vi.mock( '../data/post/middleware', () => ( { default: vi.fn() } ) );

vi.mock( '../lib/reader-router', () => ( {
	readerNotFound: vi.fn(),
} ) );

vi.mock( '../list/controller', () => ( {
	createList: vi.fn(),
	deleteList: vi.fn(),
	editList: vi.fn(),
	editListItems: vi.fn(),
	exportList: vi.fn(),
	listListing: vi.fn(),
} ) );

vi.mock( '../four-for-four/controller', () => ( {
	fourForFour: vi.fn(),
} ) );
vi.mock( '../on-this-day/controller', () => ( {
	onThisDay: vi.fn(),
} ) );

vi.mock( '../user-profile/controller', () => ( {
	redirectMeToCurrentUser: vi.fn(),
	userProfile: vi.fn(),
} ) );

type RouteCall = [ string | string[], ...unknown[] ];

// `page` is a bare jest.fn(), so its recorded calls are typed as an empty tuple.
function registeredRoutes(): RouteCall[] {
	return vi.mocked( page ).mock.calls as unknown as RouteCall[];
}

describe( 'reader routes', () => {
	beforeEach( () => {
		vi.mocked( page ).mockClear();
	} );

	it( 'registers catch-alls for reader and legacy read paths', async () => {
		await initReader();

		expect( page ).toHaveBeenCalledWith( '/reader/*', readerNotFound );
		expect( page ).toHaveBeenCalledWith( '/read/*', readerNotFound );
	} );

	it.each( [
		'/reader/list/new',
		'/reader/list/:user/:list/edit',
		'/reader/list/:user/:list/edit/items',
		'/reader/list/:user/:list/export',
		'/reader/list/:user/:list/delete',
	] )( 'requires a logged-in user for %s', async ( path ) => {
		await initReader();

		const call = registeredRoutes().find( ( [ route ] ) => route === path );
		expect( call ).toBeDefined();
		expect( call?.slice( 1 ) ).toContain( redirectLoggedOutToSignup );
	} );

	it( 'redirects the retired Reddit add-a-feed page to the generic form', async () => {
		await initReader();

		const redirects = vi
			.mocked( setupRedirectRoutes )
			.mock.calls.flatMap( ( [ routes ] ) => routes );
		const reddit = redirects.find( ( route ) => route.path === '/reader/new/reddit' );

		expect( reddit?.getRedirect() ).toBe( '/reader/new' );
	} );

	it( 'sends retired shelf links to the Reader’s retirement modal, ahead of the catch-all', async () => {
		await initReader();

		const routes = registeredRoutes();
		const shelvesIndex = routes.findIndex(
			( [ route ] ) => Array.isArray( route ) && route.includes( '/reader/shelves/*' )
		);
		const catchAllIndex = routes.findIndex( ( [ route ] ) => route === '/reader/*' );
		expect( routes[ shelvesIndex ][ 0 ] ).toEqual( [ '/reader/shelves', '/reader/shelves/*' ] );
		expect( shelvesIndex ).toBeLessThan( catchAllIndex );

		const redirectToReader = routes[ shelvesIndex ][ 1 ] as () => void;
		redirectToReader();
		expect( page.redirect ).toHaveBeenCalledWith( '/reader?retired=shelves' );
	} );

	it( 'keeps list viewing available to logged-out users', async () => {
		await initReader();

		const call = registeredRoutes().find(
			( [ route ] ) => Array.isArray( route ) && route.includes( '/reader/list/:user/:list' )
		);
		expect( call ).toBeDefined();
		expect( call?.slice( 1 ) ).not.toContain( redirectLoggedOutToSignup );
	} );
} );
