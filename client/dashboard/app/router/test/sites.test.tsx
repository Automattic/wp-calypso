/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import nock from 'nock';
import { siteOverviewRoute } from '../sites';

const site = {
	ID: 1,
	slug: 'test-site.wordpress.com',
	URL: 'https://test-site.wordpress.com',
	name: 'Test Site',
};

function runOverviewLoader() {
	const loader = siteOverviewRoute.options.loader;
	if ( ! loader ) {
		throw new Error( 'siteOverviewRoute has no loader' );
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return ( loader as any )( { params: { siteSlug: site.slug }, preload: false } );
}

beforeEach( () => {
	queryClient.clear();

	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, site );

	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );
} );

describe( 'siteOverviewRoute', () => {
	test( 'resolves when the media storage request fails', async () => {
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( `/rest/v1.1/sites/${ site.ID }/media-storage` )
			.query( true )
			.reply( 403, { error: 'unauthorized', message: 'User cannot access this private blog.' } );

		await expect( runOverviewLoader() ).resolves.not.toThrow();
	} );

	test( 'resolves when the media storage request succeeds', async () => {
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( `/rest/v1.1/sites/${ site.ID }/media-storage` )
			.query( true )
			.reply( 200, { max_storage_bytes: 1073741824, storage_used_bytes: 100000000 } );

		await expect( runOverviewLoader() ).resolves.not.toThrow();
	} );
} );
