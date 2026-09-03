/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import initReader from '../index';
import { readerNotFound } from '../lib/reader-router';

jest.mock( '@automattic/calypso-router', () => {
	const page = Object.assign( jest.fn(), { redirect: jest.fn() } );
	return {
		__esModule: true,
		default: page,
	};
} );

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: {
		isEnabled: jest.fn( () => false ),
	},
} ) );

jest.mock( '@automattic/i18n-utils', () => ( {
	getAnyLanguageRouteParam: () => ':lang([a-z]{2,3}|[a-z]{2}-[a-z]{2})',
	getLanguageRouteParam: () => ':lang(en|fr)?',
} ) );

jest.mock( 'redux-dynamic-middlewares', () => ( {
	addMiddleware: jest.fn(),
} ) );

jest.mock( 'calypso/controller', () => ( {
	makeLayout: jest.fn(),
	redirectLoggedOut: jest.fn(),
	redirectLoggedOutToSignup: jest.fn(),
	render: jest.fn(),
	setSelectedSiteIdByOrigin: jest.fn(),
} ) );

jest.mock( 'calypso/utils', () => ( {
	setupRedirectRoutes: jest.fn(),
} ) );

jest.mock( '../controller', () => ( {
	blogDiscoveryByFeedId: jest.fn(),
	blogListing: jest.fn(),
	commentSubscriptionsManager: jest.fn(),
	feedDiscovery: jest.fn(),
	feedListing: jest.fn(),
	feedLookup: jest.fn(),
	following: jest.fn(),
	loadNewSubscriptionPage: jest.fn(),
	pendingSubscriptionsManager: jest.fn(),
	readA8C: jest.fn(),
	readFollowingP2: jest.fn(),
	redirectLoggedOutToDiscover: jest.fn(),
	setupReadRoutes: jest.fn(),
	sidebar: jest.fn(),
	siteSubscription: jest.fn(),
	siteSubscriptionsManager: jest.fn(),
} ) );

jest.mock( '../data/post/middleware', () => jest.fn() );

jest.mock( '../lib/reader-router', () => ( {
	readerNotFound: jest.fn(),
} ) );

jest.mock( '../list/controller', () => ( {
	createList: jest.fn(),
	deleteList: jest.fn(),
	editList: jest.fn(),
	editListItems: jest.fn(),
	exportList: jest.fn(),
	listListing: jest.fn(),
} ) );

jest.mock( '../on-this-day/controller', () => ( {
	onThisDay: jest.fn(),
} ) );

jest.mock( '../user-profile/controller', () => ( {
	redirectMeToCurrentUser: jest.fn(),
	userProfile: jest.fn(),
} ) );

describe( 'reader routes', () => {
	beforeEach( () => {
		jest.mocked( page ).mockClear();
	} );

	it( 'registers catch-alls for reader and legacy read paths', async () => {
		await initReader();

		expect( page ).toHaveBeenCalledWith( '/reader/*', readerNotFound );
		expect( page ).toHaveBeenCalledWith( '/read/*', readerNotFound );
	} );
} );
