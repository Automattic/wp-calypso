/**
 * @vitest-environment node
 */
import { vi } from 'vitest';
import initDiscover from '../index.node';

vi.mock( '@automattic/i18n-utils', () => ( {
	getAnyLanguageRouteParam: () => ':lang([a-z]{2,3}|[a-z]{2}-[a-z]{2})',
} ) );

vi.mock( 'calypso/controller', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		makeLayout: vi.fn(),
		ssrSetupLocale: vi.fn(),
	} )
);

vi.mock( 'calypso/reader/stream/post-placeholder', () => ( { default: () => null } ) );

vi.mock( '../components/header-and-navigation', () => ( { default: () => null } ) );

vi.mock( '../components/logged-out-hero', () => ( {
	setDiscoverLoggedOutHero: vi.fn(),
} ) );

vi.mock( '../discover-document-head', () => ( {
	DiscoverDocumentHead: () => null,
} ) );

vi.mock( '../routes', () => ( {
	getLocalizedRoutes: vi.fn( () => [] ),
	getSelectedTab: vi.fn(),
} ) );

vi.mock( '../set-discover-tag-noindex', () => ( {
	setDiscoverTagNoindex: vi.fn(),
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
		const router = vi.fn();
		initDiscover( router );
		const handler = router.mock.calls.find(
			( [ paths ] ) => Array.isArray( paths ) && paths.includes( '/discover/reddit' )
		)[ 1 ];
		const redirect = vi.fn();

		handler( { params, originalUrl, res: { redirect } } );

		expect( redirect ).toHaveBeenCalledWith( 301, expected );
	} );
} );
