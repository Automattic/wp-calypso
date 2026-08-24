/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { readerNotFound } from 'calypso/reader/lib/reader-router';
import initDiscover from '../index.web';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( '@automattic/i18n-utils', () => ( {
	getAnyLanguageRouteParam: () => ':lang([a-z]{2,3}|[a-z]{2}-[a-z]{2})',
} ) );

jest.mock( 'calypso/components/async-load', () => () => null );

jest.mock( 'calypso/controller', () => ( {
	makeLayout: jest.fn(),
	redirectInvalidLanguage: jest.fn(),
	redirectLoggedOutToSignup: jest.fn(),
	redirectWithoutLocaleParamInFrontIfLoggedIn: jest.fn(),
	render: jest.fn(),
} ) );

jest.mock( 'calypso/controller/shared', () => ( {
	setLocaleMiddleware: jest.fn( () => jest.fn() ),
} ) );

jest.mock( 'calypso/lib/route', () => ( {
	sectionify: jest.fn( ( path ) => path ),
} ) );

jest.mock( 'calypso/reader/controller', () => ( {
	sidebar: jest.fn(),
} ) );

jest.mock( 'calypso/reader/controller-helper', () => ( {
	trackPageLoad: jest.fn(),
	trackScrollPage: jest.fn(),
	trackUpdatesLoaded: jest.fn(),
} ) );

jest.mock( 'calypso/reader/lib/reader-router', () => ( {
	readerNotFound: jest.fn(),
} ) );

jest.mock( 'calypso/reader/stats', () => ( {
	recordTrack: jest.fn(),
} ) );

jest.mock( 'calypso/reader/utils', () => ( {
	getCurrentTabFromURL: jest.fn(),
} ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isUserLoggedIn: jest.fn(),
} ) );

jest.mock( 'calypso/state/selectors/get-current-query-arguments', () => jest.fn() );
jest.mock( 'calypso/state/selectors/get-current-route', () => jest.fn() );

jest.mock( '../../lib/header-section', () => jest.fn() );

jest.mock( '../discover-document-head', () => ( {
	DiscoverDocumentHead: () => null,
} ) );

jest.mock( '../helper', () => ( {
	FRESHLY_PRESSED_TAB: 'fresh',
} ) );

jest.mock( '../routes', () => ( {
	DISCOVER_PREFIX: '/discover',
	getDiscoverRoutes: jest.fn( () => [ '/discover' ] ),
	getPrivateRoutes: jest.fn( () => [ '/discover/site' ] ),
} ) );

describe( 'reader discover routes', () => {
	it( 'registers the discover catch-all through the injected router', () => {
		const router = jest.fn();

		initDiscover( router );

		expect( router ).toHaveBeenCalledWith( '/discover/*', readerNotFound );
		expect( page ).not.toHaveBeenCalledWith( '/discover/*', readerNotFound );
	} );
} );
