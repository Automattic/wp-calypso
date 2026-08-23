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

jest.mock( '@tanstack/react-router', () => ( {
	notFound: () => Object.assign( new Error( 'Not found' ), { isNotFound: true } ),
} ) );

function mockProxiedFetchFails( siteId: number ) {
	return nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.1/sites/${ siteId }` )
		.query( ( q ) => q.force === undefined )
		.reply( 403, {
			error: 'unauthorized',
			message: 'The Jetpack site is inaccessible or returned an error: transport error.',
		} );
}

function mockForcedFetch( siteId: number, status: number, body: object ) {
	return nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.1/sites/${ siteId }` )
		.query( ( q ) => q.force === 'wpcom' )
		.reply( status, body );
}

describe( 'siteByIdQuery for an inaccessible Jetpack site', () => {
	afterEach( () => {
		nock.cleanAll();
		queryClient.clear();
	} );

	test( 'reports not found when the caller cannot access the site on wpcom either', async () => {
		mockProxiedFetchFails( 243314791 );
		mockForcedFetch( 243314791, 403, {
			error: 'unauthorized',
			message: 'User cannot access this private blog.',
		} );

		await expect( queryClient.fetchQuery( siteByIdQuery( 243314791 ) ) ).rejects.toMatchObject( {
			isNotFound: true,
		} );
	} );

	test( 'keeps the Jetpack error when the wpcom copy fails for another reason', async () => {
		mockProxiedFetchFails( 90011 );
		mockForcedFetch( 90011, 500, { error: 'server_error', message: 'Something went wrong.' } );

		await expect( queryClient.fetchQuery( siteByIdQuery( 90011 ) ) ).rejects.toThrow(
			/The Jetpack site is inaccessible/
		);
	} );

	test( 'still returns the wpcom copy when the caller can access the site', async () => {
		mockProxiedFetchFails( 90010 );
		mockForcedFetch( 90010, 200, {
			ID: 90010,
			slug: 'example.com',
			name: 'Test',
			URL: 'https://example.com',
			options: {},
		} );

		const site = ( await queryClient.fetchQuery( siteByIdQuery( 90010 ) ) ) as Site;

		expect( site.ID ).toBe( 90010 );
		expect( site.__inaccessible_jetpack_error ).toBeDefined();
	} );
} );
