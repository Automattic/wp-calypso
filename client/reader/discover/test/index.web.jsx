/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { readerNotFound } from 'calypso/reader/lib/reader-router';
import initDiscover from '../index.web';

jest.mock( '@automattic/calypso-router', () => {
	const pageMock = Object.assign( jest.fn(), { redirect: jest.fn() } );
	return {
		__esModule: true,
		default: pageMock,
	};
} );

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

jest.mock( '../components/logged-out-hero', () => ( {
	setDiscoverLoggedOutHero: jest.fn(),
} ) );

jest.mock( '../discover-document-head', () => ( {
	DiscoverDocumentHead: () => null,
} ) );

jest.mock( '../search-controller', () => ( {
	fetchTrendingTagsIfLoggedOut: jest.fn(),
	search: jest.fn(),
} ) );

jest.mock( '../routes', () => ( {
	getDiscoverRoutes: jest.fn( () => [ '/discover' ] ),
	getPrivateRoutes: jest.fn( () => [ '/discover/site' ] ),
	getSearchRoutes: jest.fn( () => [ '/discover/search' ] ),
	getSelectedTab: jest.fn(),
} ) );

describe( 'reader discover routes', () => {
	it( 'registers the discover catch-all through the injected router', () => {
		const router = jest.fn();

		initDiscover( router );

		expect( router ).toHaveBeenCalledWith( '/discover/*', readerNotFound );
		expect( page ).not.toHaveBeenCalledWith( '/discover/*', readerNotFound );
		expect( router ).toHaveBeenCalledWith(
			[ '/discover/reddit', '/:lang([a-z]{2,3}|[a-z]{2}-[a-z]{2})/discover/reddit' ],
			expect.any( Function )
		);
	} );

	it.each( [
		{
			params: {},
			querystring: '',
			expected: '/discover/add-new',
		},
		{
			params: { lang: 'es' },
			querystring: '',
			expected: '/es/discover/add-new',
		},
		{
			params: {},
			querystring: 'flags=reader',
			expected: '/discover/add-new?flags=reader',
		},
		{
			params: { lang: 'fr' },
			querystring: 'flags=reader',
			expected: '/fr/discover/add-new?flags=reader',
		},
	] )( 'redirects a retired reddit url to $expected', ( { params, querystring, expected } ) => {
		page.redirect.mockClear();
		const router = jest.fn();
		initDiscover( router );
		const handler = router.mock.calls.find(
			( [ paths ] ) => Array.isArray( paths ) && paths.includes( '/discover/reddit' )
		)[ 1 ];

		handler( { params, querystring } );

		expect( page.redirect ).toHaveBeenCalledWith( expected );
	} );
} );
