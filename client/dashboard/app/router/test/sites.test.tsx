/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import { defaultParseSearch } from '@tanstack/react-router';
import nock from 'nock';
import { siteBackupsRoute, siteLogsRoute, siteOverviewRoute } from '../sites';

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
	).resolves.toBeUndefined();
} );

describe( 'siteOverviewRoute search', () => {
	type ValidateSearch = ( search: Record< string, unknown > ) => {
		difmOffer?: string;
		source?: string;
	};

	const validateSearch = siteOverviewRoute.options.validateSearch as unknown as ValidateSearch;

	test( 'keeps the params the DIFM offer deep link opens the modal with', () => {
		const search = validateSearch( defaultParseSearch( '?difmOffer=open&source=site-setup' ) );

		expect( search.difmOffer ).toBe( 'open' );
		expect( search.source ).toBe( 'site-setup' );
	} );

	test( 'keeps the param the DIFM offer thank-you modal opens with', () => {
		const search = validateSearch( defaultParseSearch( '?difmOffer=purchased' ) );

		expect( search.difmOffer ).toBe( 'purchased' );
	} );

	test( 'drops an unknown DIFM offer value', () => {
		const search = validateSearch( defaultParseSearch( '?difmOffer=unknown' ) );

		expect( search.difmOffer ).toBeUndefined();
	} );
} );

describe( 'date range routes search', () => {
	test.each( [
		[ 'siteLogsRoute', siteLogsRoute ],
		[ 'siteBackupsRoute', siteBackupsRoute ],
	] )( '%s normalizes millisecond from/to params to seconds', ( _, route ) => {
		const validateSearch = route.options.validateSearch as unknown as (
			search: Record< string, unknown >
		) => { from?: number; to?: number };

		const search = validateSearch( defaultParseSearch( '?from=1729987200000&to=1730159999000' ) );

		expect( search ).toMatchObject( { from: 1729987200, to: 1730159999 } );
	} );
} );
