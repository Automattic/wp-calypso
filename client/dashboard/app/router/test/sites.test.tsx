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

beforeEach( () => {
	queryClient.clear();

	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, site );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );
} );

test( 'loads the site overview when the user cannot read media storage', async () => {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.ID }/media-storage` )
		.query( true )
		.reply( 403, { error: 'unauthorized', message: 'User cannot view media storage limits' } );

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const loader = siteOverviewRoute.options.loader as any;

	await expect(
		loader( { params: { siteSlug: site.slug }, preload: false } )
	).resolves.not.toThrow();
} );
