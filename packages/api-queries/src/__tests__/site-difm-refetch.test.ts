import nock from 'nock';
import { queryClient } from '../query-client';
import { siteByIdQuery } from '../site';
import type { Site } from '@automattic/api-core';

// Same-instance query client so site.ts and the test share state.
jest.mock( '../query-client', () => {
	const { QueryClient: QC } = jest.requireActual( '@tanstack/react-query' );
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
		options: {},
		...overrides,
	} as Site;
}

function mockGetSite( siteId: number, site: Site, { force = false }: { force?: boolean } = {} ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ siteId }` )
		.query( ( q ) => ( force ? q.force === 'wpcom' : q.force === undefined ) )
		.reply( 200, site );
}

describe( 'siteByIdQuery DIFM pre-submit flag refetch', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'refetches with force=wpcom when the flag is missing on a Jetpack DIFM site', async () => {
		const proxied = mockGetSite(
			90001,
			makeSite( {
				ID: 90001,
				jetpack: true,
				options: { is_difm_lite_in_progress: true },
			} )
		);
		const forced = mockGetSite(
			90001,
			makeSite( {
				ID: 90001,
				jetpack: true,
				options: {
					is_difm_lite_in_progress: true,
					difm_lite_site_options: { is_website_content_submitted: false },
				},
			} ),
			{ force: true }
		);

		const site = ( await queryClient.fetchQuery( siteByIdQuery( 90001 ) ) ) as Site;

		expect( site.options?.difm_lite_site_options?.is_website_content_submitted ).toBe( false );
		expect( proxied.isDone() ).toBe( true );
		expect( forced.isDone() ).toBe( true );
	} );

	test( 'does not refetch when the flag is already present', async () => {
		// No forced route is mocked: a refetch would fail this test.
		const proxied = mockGetSite(
			90002,
			makeSite( {
				ID: 90002,
				jetpack: true,
				options: {
					is_difm_lite_in_progress: true,
					difm_lite_site_options: { is_website_content_submitted: true },
				},
			} )
		);

		const site = ( await queryClient.fetchQuery( siteByIdQuery( 90002 ) ) ) as Site;

		expect( site.options?.difm_lite_site_options?.is_website_content_submitted ).toBe( true );
		expect( proxied.isDone() ).toBe( true );
	} );

	test( 'does not refetch for non-Jetpack (Simple) DIFM sites', async () => {
		const proxied = mockGetSite(
			90003,
			makeSite( {
				ID: 90003,
				jetpack: false,
				options: { is_difm_lite_in_progress: true },
			} )
		);

		const site = ( await queryClient.fetchQuery( siteByIdQuery( 90003 ) ) ) as Site;

		expect( site.options?.difm_lite_site_options ).toBeUndefined();
		expect( proxied.isDone() ).toBe( true );
	} );

	test( 'settles after exactly one refetch when the forced response still lacks the flag', async () => {
		const proxied = mockGetSite(
			90004,
			makeSite( {
				ID: 90004,
				jetpack: true,
				options: { is_difm_lite_in_progress: true },
			} )
		);
		const forced = mockGetSite(
			90004,
			makeSite( {
				ID: 90004,
				jetpack: true,
				options: { is_difm_lite_in_progress: true },
			} ),
			{ force: true }
		);

		const site = ( await queryClient.fetchQuery( siteByIdQuery( 90004 ) ) ) as Site;

		// Fail-safe: the flag is still missing, consumers keep the lockout.
		expect( site.options?.difm_lite_site_options ).toBeUndefined();
		expect( proxied.isDone() ).toBe( true );
		expect( forced.isDone() ).toBe( true );
	} );
} );
