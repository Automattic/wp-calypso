import nock from 'nock';
import { queryClient } from '../query-client';
import { siteBySlugQuery, siteByIdQuery } from '../site';
import { startSiteCollisionListener } from '../site-collision-listener';
import { sitesQuery, paginatedSitesQuery } from '../sites';
import type { Site } from '@automattic/api-core';

// Mock with Jest so that the same client is used in siteBySlugQuery/siteByIdQuery
jest.mock( '../query-client', () => {
	const { QueryClient: QC } = require( '@tanstack/react-query' );
	const qc = new QC( { defaultOptions: { queries: { retry: false } } } );
	return { queryClient: qc };
} );

// notFound used in queryFn error handling — won't fire in success-path tests.
jest.mock( '@tanstack/react-router', () => ( {
	notFound: () => new Error( 'Not found' ),
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

function mockFetchSite( siteIdOrSlug: string | number, site: Site ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ siteIdOrSlug }` )
		.query( true )
		.reply( 200, site );
}

function seedJetpackUrls( urls: string[] ) {
	queryClient.setQueryData( [ 'jetpack-site-urls' ], urls );
}

describe( 'startSiteCollisionListener', () => {
	let unsubscribe: () => void;

	beforeEach( () => {
		unsubscribe = startSiteCollisionListener( queryClient );
	} );

	afterEach( () => {
		unsubscribe();
		queryClient.clear();
	} );

	test( 'rewrites slug on site-by-slug when jetpack URLs are cached', async () => {
		seedJetpackUrls( [ 'example.com' ] );

		mockFetchSite( 'example.com', makeSite( {} ) );
		await queryClient.fetchQuery( siteBySlugQuery( 'example.com' ) );

		const fixed = queryClient.getQueryData( siteBySlugQuery( 'example.com' ).queryKey );
		expect( fixed?.slug ).toBe( 'example.wordpress.com' );
	} );

	test( 'seeds corrected slug key', async () => {
		seedJetpackUrls( [ 'example.com' ] );

		mockFetchSite( 'example.com', makeSite( {} ) );
		await queryClient.fetchQuery( siteBySlugQuery( 'example.com' ) );

		const atNewKey = queryClient.getQueryData(
			siteBySlugQuery( 'example.wordpress.com' ).queryKey
		);
		expect( atNewKey?.slug ).toBe( 'example.wordpress.com' );
	} );

	test( 'rewrites slug on site-by-id', async () => {
		seedJetpackUrls( [ 'example.com' ] );

		mockFetchSite( 42, makeSite( { ID: 42 } ) );
		await queryClient.fetchQuery( siteByIdQuery( 42 ) );

		const fixed = queryClient.getQueryData( siteByIdQuery( 42 ).queryKey );
		expect( fixed?.slug ).toBe( 'example.wordpress.com' );
	} );

	test( 'does not rewrite jetpack sites', () => {
		seedJetpackUrls( [ 'example.com' ] );

		const site = makeSite( { jetpack: true } );
		queryClient.setQueryData( siteBySlugQuery( 'example.com' ).queryKey, site );

		const result = queryClient.getQueryData( siteBySlugQuery( 'example.com' ).queryKey );
		expect( result?.slug ).toBe( 'example.com' );
	} );

	test( 'adds jetpack site URL to cached set when a jetpack site arrives', async () => {
		seedJetpackUrls( [] );

		mockFetchSite( 'jp-site.com', makeSite( { jetpack: true, URL: 'https://jp-site.com' } ) );
		await queryClient.fetchQuery( siteBySlugQuery( 'jp-site.com' ) );

		const urls = queryClient.getQueryData< string[] >( [ 'jetpack-site-urls' ] );
		expect( urls ).toContain( 'jp-site.com' );
	} );

	test( 'does not duplicate when jetpack URL already in set', () => {
		seedJetpackUrls( [ 'jp-site.com' ] );

		const site = makeSite( { jetpack: true, URL: 'https://jp-site.com' } );
		queryClient.setQueryData( siteBySlugQuery( 'jp-site.com' ).queryKey, site );

		const urls = queryClient.getQueryData< string[] >( [ 'jetpack-site-urls' ] );
		expect( urls ).toHaveLength( 1 );
	} );

	test( 'does not rewrite when no collision', () => {
		seedJetpackUrls( [ 'other.com' ] );

		const site = makeSite( {} );
		queryClient.setQueryData( siteBySlugQuery( 'example.com' ).queryKey, site );

		const result = queryClient.getQueryData( siteBySlugQuery( 'example.com' ).queryKey );
		expect( result?.slug ).toBe( 'example.com' );
	} );

	test( 'does nothing when jetpack URLs are not yet cached', () => {
		const site = makeSite( {} );
		queryClient.setQueryData( siteBySlugQuery( 'example.com' ).queryKey, site );

		const result = queryClient.getQueryData( siteBySlugQuery( 'example.com' ).queryKey );
		expect( result?.slug ).toBe( 'example.com' );
	} );

	test( 'replaces slashes with :: in corrected slug', () => {
		seedJetpackUrls( [ 'example.com' ] );

		const site = makeSite( {
			options: { unmapped_url: 'https://example.wordpress.com/path' } as Site[ 'options' ],
		} );
		queryClient.setQueryData( siteBySlugQuery( 'example.com' ).queryKey, site );

		const fixed = queryClient.getQueryData( siteBySlugQuery( 'example.com' ).queryKey );
		expect( fixed?.slug ).toBe( 'example.wordpress.com::path' );
	} );

	test( 'adds jetpack URLs from sites list to cached set', () => {
		seedJetpackUrls( [] );

		const sites = [
			makeSite( { ID: 1, jetpack: true, URL: 'https://jp1.com', slug: 'jp1.com' } ),
			makeSite( { ID: 2, jetpack: true, URL: 'https://jp2.com', slug: 'jp2.com' } ),
			makeSite( { ID: 3, jetpack: false, slug: 'wpcom.com' } ),
		];
		queryClient.setQueryData( [ 'sites', 'all' ], sites );

		const urls = queryClient.getQueryData< string[] >( [ 'jetpack-site-urls' ] );
		expect( urls ).toContain( 'jp1.com' );
		expect( urls ).toContain( 'jp2.com' );
		expect( urls ).toHaveLength( 2 );
	} );

	test( 'rewrites sites in a sites list array', () => {
		seedJetpackUrls( [ 'example.com' ] );

		const sites = [ makeSite( {} ) ];
		queryClient.setQueryData( [ 'sites', 'extra' ], sites );

		const fixed = queryClient.getQueryData< Site[] >( [ 'sites', 'extra' ] );
		expect( fixed?.[ 0 ].slug ).toBe( 'example.wordpress.com' );
	} );

	test( 'rewrites sites in a paginated response', () => {
		seedJetpackUrls( [ 'example.com' ] );

		const data = { sites: [ makeSite( {} ) ], total: 1 };
		queryClient.setQueryData( [ 'sites', 'paginated' ], data );

		const fixed = queryClient.getQueryData< { sites: Site[] } >( [ 'sites', 'paginated' ] );
		expect( fixed?.sites[ 0 ].slug ).toBe( 'example.wordpress.com' );
	} );

	test( 'retroactively fixes cached sites when jetpack URLs arrive', () => {
		// Site cached before jetpack URLs are available.
		const site = makeSite( {} );
		queryClient.setQueryData( siteBySlugQuery( 'example.com' ).queryKey, site );

		expect( queryClient.getQueryData( siteBySlugQuery( 'example.com' ).queryKey )?.slug ).toBe(
			'example.com'
		);

		// Jetpack URLs arrive — should retroactively fix.
		seedJetpackUrls( [ 'example.com' ] );

		expect( queryClient.getQueryData( siteBySlugQuery( 'example.com' ).queryKey )?.slug ).toBe(
			'example.wordpress.com'
		);
	} );

	describe( 'fallback scan detects collisions before jetpack-site-urls resolves', () => {
		const cases = [
			{
				name: 'site-by-id',
				seedJp: ( jp: Site ) => queryClient.setQueryData( siteByIdQuery( jp.ID ).queryKey, jp ),
				jpSite: { ID: 99, slug: 'byid.com', URL: 'https://byid.com' },
				wpcomSlug: 'byid.com',
			},
			{
				name: 'site-by-slug',
				seedJp: ( jp: Site ) => queryClient.setQueryData( siteBySlugQuery( jp.slug ).queryKey, jp ),
				jpSite: { ID: 50, slug: 'jp-origin.com', URL: 'https://byslug.com' },
				wpcomSlug: 'byslug.com',
			},
			{
				name: 'sites list',
				seedJp: ( jp: Site ) => queryClient.setQueryData( sitesQuery( 'all' ).queryKey, [ jp ] ),
				jpSite: { ID: 60, slug: 'listed.com', URL: 'https://listed.com' },
				wpcomSlug: 'listed.com',
			},
			{
				name: 'sites paginated',
				seedJp: ( jp: Site ) =>
					queryClient.setQueryData( paginatedSitesQuery( 'all' ).queryKey, {
						sites: [ jp ],
						total: 1,
					} ),
				jpSite: { ID: 70, slug: 'paged.com', URL: 'https://paged.com' },
				wpcomSlug: 'paged.com',
			},
		];

		for ( const { name, seedJp, jpSite, wpcomSlug } of cases ) {
			test( `via ${ name }`, () => {
				seedJp( makeSite( { ...jpSite, jetpack: true } ) );

				const wpcom = makeSite( {
					ID: jpSite.ID + 1000,
					slug: wpcomSlug,
					URL: `https://${ wpcomSlug }`,
					options: {
						unmapped_url: `https://${ wpcomSlug.replace( '.com', '' ) }.wordpress.com`,
					} as Site[ 'options' ],
				} );
				queryClient.setQueryData( siteBySlugQuery( wpcomSlug ).queryKey, wpcom );

				expect( queryClient.getQueryData( siteBySlugQuery( wpcomSlug ).queryKey )?.slug ).toBe(
					`${ wpcomSlug.replace( '.com', '' ) }.wordpress.com`
				);
			} );
		}
	} );

	test( 'does not infinite-loop from cascading setQueryData calls', () => {
		seedJetpackUrls( [ 'example.com' ] );

		let callCount = 0;
		const innerUnsubscribe = queryClient.getQueryCache().subscribe( () => {
			callCount++;
		} );

		const site = makeSite( {} );
		queryClient.setQueryData( siteBySlugQuery( 'example.com' ).queryKey, site );

		innerUnsubscribe();

		// The listener fires for the initial set + its own writes, but should
		// be bounded (not hundreds/thousands from infinite recursion).
		expect( callCount ).toBeLessThan( 20 );
	} );
} );
