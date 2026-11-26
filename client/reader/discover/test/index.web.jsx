/**
 * @vitest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { vi } from 'vitest';
import { readerNotFound } from 'calypso/reader/lib/reader-router';
import initDiscover from '../index.web';

vi.mock( '@automattic/calypso-router', () => {
	const pageMock = Object.assign( vi.fn(), { redirect: vi.fn() } );
	return {
		__esModule: true,
		default: pageMock,
	};
} );

vi.mock( '@automattic/i18n-utils', () => ( {
	getAnyLanguageRouteParam: () => ':lang([a-z]{2,3}|[a-z]{2}-[a-z]{2})',
} ) );

vi.mock( 'calypso/components/async-load', () => ( { default: () => null } ) );

vi.mock( 'calypso/controller', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		makeLayout: vi.fn(),
		redirectInvalidLanguage: vi.fn(),
		redirectLoggedOutToSignup: vi.fn(),
		redirectWithoutLocaleParamInFrontIfLoggedIn: vi.fn(),
		render: vi.fn(),
	} )
);

vi.mock( 'calypso/controller/shared', () => ( {
	setLocaleMiddleware: vi.fn( () => vi.fn() ),
} ) );

vi.mock( 'calypso/lib/route', () => ( {
	sectionify: vi.fn( ( path ) => path ),
} ) );

vi.mock( 'calypso/reader/controller', () => ( {
	sidebar: vi.fn(),
} ) );

vi.mock( 'calypso/reader/controller-helper', () => ( {
	trackPageLoad: vi.fn(),
	trackScrollPage: vi.fn(),
	trackUpdatesLoaded: vi.fn(),
} ) );

vi.mock( 'calypso/reader/lib/reader-router', () => ( {
	readerNotFound: vi.fn(),
} ) );

vi.mock( 'calypso/reader/stats', () => ( {
	recordTrack: vi.fn(),
} ) );

vi.mock( 'calypso/reader/utils', () => ( {
	getCurrentTabFromURL: vi.fn(),
} ) );

vi.mock( 'calypso/state/current-user/selectors', () => ( {
	isUserLoggedIn: vi.fn(),
} ) );

vi.mock( 'calypso/state/selectors/get-current-query-arguments', () => ( { default: vi.fn() } ) );
vi.mock( 'calypso/state/selectors/get-current-route', () => ( { default: vi.fn() } ) );

vi.mock( '../components/logged-out-hero', () => ( {
	setDiscoverLoggedOutHero: vi.fn(),
} ) );

vi.mock( '../discover-document-head', () => ( {
	DiscoverDocumentHead: () => null,
} ) );

vi.mock( '../search-controller', () => ( {
	fetchTrendingTagsIfLoggedOut: vi.fn(),
	search: vi.fn(),
} ) );

vi.mock( '../routes', () => ( {
	getDiscoverRoutes: vi.fn( () => [ '/discover' ] ),
	getPrivateRoutes: vi.fn( () => [ '/discover/site' ] ),
	getSearchRoutes: vi.fn( () => [ '/discover/search' ] ),
	getSelectedTab: vi.fn(),
} ) );

describe( 'reader discover routes', () => {
	it( 'registers the discover catch-all through the injected router', () => {
		const router = vi.fn();

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
		const router = vi.fn();
		initDiscover( router );
		const handler = router.mock.calls.find(
			( [ paths ] ) => Array.isArray( paths ) && paths.includes( '/discover/reddit' )
		)[ 1 ];

		handler( { params, querystring } );

		expect( page.redirect ).toHaveBeenCalledWith( expected );
	} );
} );
