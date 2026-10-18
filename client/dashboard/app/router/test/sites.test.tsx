/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import { defaultParseSearch } from '@tanstack/react-router';
import nock from 'nock';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { siteOverviewRoute } from '../sites';

const context = { config: APP_CONTEXT_DEFAULT_CONFIG };

const site = {
	ID: 1,
	slug: 'test-site.wordpress.com',
	URL: 'https://test-site.wordpress.com',
	name: 'Test Site',
	plan: { features: { active: [ 'set-primary-custom-domain' ] } },
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
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains: [] } );

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const loader = siteOverviewRoute.options.loader as any;

	await expect(
		loader( { context, params: { siteSlug: site.slug }, preload: false } )
	).resolves.toBeUndefined();
} );

test( 'loads the site overview when the domains list fails to load', async () => {
	const domainsRequest = nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 500, { error: 'server_error', message: 'Something went wrong' } );
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.ID }/media-storage` )
		.query( true )
		.reply( 200, { max_storage_bytes: 1073741824, storage_used_bytes: 100000000 } );

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const loader = siteOverviewRoute.options.loader as any;

	await expect(
		loader( { context, params: { siteSlug: site.slug }, preload: false } )
	).resolves.toBeUndefined();
	expect( domainsRequest.isDone() ).toBe( true );
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
