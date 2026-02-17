import { QueryClient } from '@tanstack/react-query';
import { startSiteCollisionListener } from '../site-collision-listener';
import type { Site } from '@automattic/api-core';

// Mock site query key builders to avoid circular dependency on query-client.
jest.mock( '../site', () => ( {
	siteBySlugQuery: ( slug: string ) => ( {
		queryKey: [ 'site-by-slug', slug ],
	} ),
	siteByIdQuery: ( id: number ) => ( {
		queryKey: [ 'site-by-id', id ],
	} ),
} ) );

jest.mock( '../sites', () => ( {
	sitesQueryKey: [ 'sites' ],
} ) );

function makeSite( overrides: Partial< Site > ): Site {
	return {
		ID: 1,
		slug: 'example.com',
		name: 'Test',
		URL: 'https://example.com',
		jetpack: false,
		options: { unmapped_url: 'https://example.wordpress.com' },
		...overrides,
	} as Site;
}

describe( 'startSiteCollisionListener', () => {
	let qc: QueryClient;
	let unsubscribe: () => void;

	beforeEach( () => {
		qc = new QueryClient();
		unsubscribe = startSiteCollisionListener( qc );
	} );

	afterEach( () => {
		unsubscribe();
		qc.clear();
	} );

	function seedJetpackUrls( urls: string[] ) {
		qc.setQueryData( [ 'jetpack-site-urls' ], new Set( urls ) );
	}

	it( 'rewrites slug on site-by-slug when jetpack URLs are cached', () => {
		seedJetpackUrls( [ 'example.com' ] );

		const site = makeSite( {} );
		qc.setQueryData( [ 'site-by-slug', 'example.com' ], site );

		const fixed = qc.getQueryData< Site >( [ 'site-by-slug', 'example.com' ] );
		expect( fixed?.slug ).toBe( 'example.wordpress.com' );
	} );

	it( 'seeds corrected slug key', () => {
		seedJetpackUrls( [ 'example.com' ] );

		const site = makeSite( {} );
		qc.setQueryData( [ 'site-by-slug', 'example.com' ], site );

		const atNewKey = qc.getQueryData< Site >( [ 'site-by-slug', 'example.wordpress.com' ] );
		expect( atNewKey?.slug ).toBe( 'example.wordpress.com' );
	} );

	it( 'rewrites slug on site-by-id', () => {
		seedJetpackUrls( [ 'example.com' ] );

		const site = makeSite( { ID: 42 } );
		qc.setQueryData( [ 'site-by-id', 42 ], site );

		const fixed = qc.getQueryData< Site >( [ 'site-by-id', 42 ] );
		expect( fixed?.slug ).toBe( 'example.wordpress.com' );
	} );

	it( 'does not rewrite jetpack sites', () => {
		seedJetpackUrls( [ 'example.com' ] );

		const site = makeSite( { jetpack: true } );
		qc.setQueryData( [ 'site-by-slug', 'example.com' ], site );

		const result = qc.getQueryData< Site >( [ 'site-by-slug', 'example.com' ] );
		expect( result?.slug ).toBe( 'example.com' );
	} );

	it( 'adds jetpack site URL to cached set when a jetpack site arrives', () => {
		seedJetpackUrls( [] );

		const site = makeSite( { jetpack: true, URL: 'https://jp-site.com' } );
		qc.setQueryData( [ 'site-by-slug', 'jp-site.com' ], site );

		const urls = qc.getQueryData< Set< string > >( [ 'jetpack-site-urls' ] );
		expect( urls?.has( 'jp-site.com' ) ).toBe( true );
	} );

	it( 'does not duplicate when jetpack URL already in set', () => {
		seedJetpackUrls( [ 'jp-site.com' ] );

		const site = makeSite( { jetpack: true, URL: 'https://jp-site.com' } );
		qc.setQueryData( [ 'site-by-slug', 'jp-site.com' ], site );

		const urls = qc.getQueryData< Set< string > >( [ 'jetpack-site-urls' ] );
		expect( urls?.size ).toBe( 1 );
	} );

	it( 'does not rewrite when no collision', () => {
		seedJetpackUrls( [ 'other.com' ] );

		const site = makeSite( {} );
		qc.setQueryData( [ 'site-by-slug', 'example.com' ], site );

		const result = qc.getQueryData< Site >( [ 'site-by-slug', 'example.com' ] );
		expect( result?.slug ).toBe( 'example.com' );
	} );

	it( 'does nothing when jetpack URLs are not yet cached', () => {
		const site = makeSite( {} );
		qc.setQueryData( [ 'site-by-slug', 'example.com' ], site );

		const result = qc.getQueryData< Site >( [ 'site-by-slug', 'example.com' ] );
		expect( result?.slug ).toBe( 'example.com' );
	} );

	it( 'replaces slashes with :: in corrected slug', () => {
		seedJetpackUrls( [ 'example.com' ] );

		const site = makeSite( {
			options: { unmapped_url: 'https://example.wordpress.com/path' } as Site[ 'options' ],
		} );
		qc.setQueryData( [ 'site-by-slug', 'example.com' ], site );

		const fixed = qc.getQueryData< Site >( [ 'site-by-slug', 'example.com' ] );
		expect( fixed?.slug ).toBe( 'example.wordpress.com::path' );
	} );

	it( 'adds jetpack URLs from sites list to cached set', () => {
		seedJetpackUrls( [] );

		const sites = [
			makeSite( { ID: 1, jetpack: true, URL: 'https://jp1.com', slug: 'jp1.com' } ),
			makeSite( { ID: 2, jetpack: true, URL: 'https://jp2.com', slug: 'jp2.com' } ),
			makeSite( { ID: 3, jetpack: false, slug: 'wpcom.com' } ),
		];
		qc.setQueryData( [ 'sites', 'all' ], sites );

		const urls = qc.getQueryData< Set< string > >( [ 'jetpack-site-urls' ] );
		expect( urls?.has( 'jp1.com' ) ).toBe( true );
		expect( urls?.has( 'jp2.com' ) ).toBe( true );
		expect( urls?.size ).toBe( 2 );
	} );

	it( 'rewrites sites in a sites list array', () => {
		seedJetpackUrls( [ 'example.com' ] );

		const sites = [ makeSite( {} ) ];
		qc.setQueryData( [ 'sites', 'extra' ], sites );

		const fixed = qc.getQueryData< Site[] >( [ 'sites', 'extra' ] );
		expect( fixed?.[ 0 ].slug ).toBe( 'example.wordpress.com' );
	} );

	it( 'rewrites sites in a paginated response', () => {
		seedJetpackUrls( [ 'example.com' ] );

		const data = { sites: [ makeSite( {} ) ], total: 1 };
		qc.setQueryData( [ 'sites', 'paginated' ], data );

		const fixed = qc.getQueryData< { sites: Site[] } >( [ 'sites', 'paginated' ] );
		expect( fixed?.sites[ 0 ].slug ).toBe( 'example.wordpress.com' );
	} );

	it( 'retroactively fixes cached sites when jetpack URLs arrive', () => {
		// Site cached before jetpack URLs are available.
		const site = makeSite( {} );
		qc.setQueryData( [ 'site-by-slug', 'example.com' ], site );

		expect( qc.getQueryData< Site >( [ 'site-by-slug', 'example.com' ] )?.slug ).toBe(
			'example.com'
		);

		// Jetpack URLs arrive — should retroactively fix.
		seedJetpackUrls( [ 'example.com' ] );

		expect( qc.getQueryData< Site >( [ 'site-by-slug', 'example.com' ] )?.slug ).toBe(
			'example.wordpress.com'
		);
	} );
} );
