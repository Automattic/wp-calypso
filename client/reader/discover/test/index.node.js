/**
 * @jest-environment node
 */
import initDiscover from '../index.node';

jest.mock( '@automattic/i18n-utils', () => ( {
	getAnyLanguageRouteParam: () => ':lang([a-z]{2,3}|[a-z]{2}-[a-z]{2})',
} ) );

jest.mock( 'calypso/controller', () => ( {
	makeLayout: jest.fn(),
	ssrSetupLocale: jest.fn(),
} ) );

jest.mock( 'calypso/reader/stream/post-placeholder', () => () => null );

jest.mock( '../components/header-and-navigation', () => () => null );

jest.mock( '../components/logged-out-hero', () => ( {
	setDiscoverLoggedOutHero: jest.fn(),
} ) );

jest.mock( '../discover-document-head', () => ( {
	DiscoverDocumentHead: () => null,
} ) );

jest.mock( '../routes', () => ( {
	getLocalizedRoutes: jest.fn( () => [] ),
	getSelectedTab: jest.fn(),
} ) );

jest.mock( '../set-discover-tag-noindex', () => ( {
	setDiscoverTagNoindex: jest.fn(),
} ) );

describe( 'retired reddit discover redirect', () => {
	it.each( [
		{
			params: {},
			originalUrl: '/discover/reddit',
			expected: '/discover/add-new',
		},
		{
			params: { lang: 'es' },
			originalUrl: '/es/discover/reddit',
			expected: '/es/discover/add-new',
		},
		{
			params: {},
			originalUrl: '/discover/reddit?flags=reader',
			expected: '/discover/add-new?flags=reader',
		},
		{
			params: { lang: 'fr' },
			originalUrl: '/fr/discover/reddit?flags=reader',
			expected: '/fr/discover/add-new?flags=reader',
		},
	] )( 'redirects $originalUrl to $expected', ( { params, originalUrl, expected } ) => {
		const router = jest.fn();
		initDiscover( router );
		const handler = router.mock.calls.find(
			( [ paths ] ) => Array.isArray( paths ) && paths.includes( '/discover/reddit' )
		)[ 1 ];
		const redirect = jest.fn();

		handler( { params, originalUrl, res: { redirect } } );

		expect( redirect ).toHaveBeenCalledWith( 301, expected );
	} );
} );
