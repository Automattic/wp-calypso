/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import nock from 'nock';
import { siteRoute } from '../sites';

const SITE_SLUG = 'production.example.com';
const SITE_ID = 1;
const STAGING_SITE_ID = 2;

function runSiteLoader() {
	const loader = siteRoute.options.loader;
	if ( ! loader ) {
		throw new Error( 'siteRoute has no loader' );
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return ( loader as any )( { params: { siteSlug: SITE_SLUG }, cause: 'enter' } );
}

beforeEach( () => {
	queryClient.clear();

	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.1/sites/${ SITE_SLUG }` )
		.query( true )
		.reply( 200, {
			ID: SITE_ID,
			slug: SITE_SLUG,
			name: 'Production',
			URL: `https://${ SITE_SLUG }`,
			is_wpcom_staging_site: false,
			options: { wpcom_staging_blog_ids: [ STAGING_SITE_ID ] },
		} );

	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );
} );

describe( 'siteRoute', () => {
	test( 'loads when the staging site is inaccessible to this user', async () => {
		// The proxied request fails, and the caller is not a member of the private
		// staging blog, so the wpcom fallback is refused too.
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( `/rest/v1.1/sites/${ STAGING_SITE_ID }` )
			.query( ( q ) => q.force === undefined )
			.reply( 403, {
				error: 'unauthorized',
				message: 'The Jetpack site is inaccessible or returned an error: transport error.',
			} );

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( `/rest/v1.1/sites/${ STAGING_SITE_ID }` )
			.query( ( q ) => q.force === 'wpcom' )
			.reply( 403, {
				error: 'unauthorized',
				message: 'User cannot access this private blog.',
			} );

		const result = await runSiteLoader();

		expect( result.site.ID ).toBe( SITE_ID );
	} );

	test( 'loads when the staging site is reachable', async () => {
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( `/rest/v1.1/sites/${ STAGING_SITE_ID }` )
			.query( true )
			.reply( 200, {
				ID: STAGING_SITE_ID,
				slug: 'staging.example.com',
				name: 'Staging',
				URL: 'https://staging.example.com',
				is_wpcom_staging_site: true,
				options: { wpcom_production_blog_id: SITE_ID },
			} );

		const result = await runSiteLoader();

		expect( result.site.ID ).toBe( SITE_ID );
	} );
} );
