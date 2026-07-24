import nock from 'nock';
import { fetchBundleForDomain, fetchBundleMetadata } from '..';
import type { BundleSuggestion } from '../types';

const BASE = 'https://public-api.wordpress.com';

const bundleSuggestion: BundleSuggestion = {
	sld: 'example',
	domains: [
		{
			domain: 'example.com',
			cost: '$22.00',
			raw_price: 22,
			product_slug: 'domain_reg',
			supports_privacy: true,
		},
		{
			domain: 'example.net',
			cost: '$18.00',
			raw_price: 18,
			product_slug: 'domain_reg',
			supports_privacy: true,
		},
	],
	bundle_price: 40,
	original_price: 50,
	discount_percent: 20,
	category: 'business',
	bundle_id: 'example_business',
	bundle_group_id: 'signed-group-id',
	catalogue_version: '1',
};

describe( 'fetchBundleMetadata', () => {
	afterEach( () => nock.cleanAll() );

	it( 'requests /domains/suggestions with with_bundles=1 and returns both bundle fields', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.1/domains/suggestions' )
			.query( ( query ) => query.with_bundles === '1' && query.query === 'example' )
			.reply( 200, {
				domain_suggestions: [],
				bundle_suggestion: bundleSuggestion,
				bundle_triggers: [ 'com' ],
			} );

		const metadata = await fetchBundleMetadata( 'example' );

		expect( scope.isDone() ).toBe( true );
		expect( metadata ).toEqual( {
			bundle_suggestion: bundleSuggestion,
			bundle_triggers: [ 'com' ],
		} );
	} );

	it( 'lowercases the query before sending it', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.1/domains/suggestions' )
			.query( ( query ) => query.query === 'mybrand.com' )
			.reply( 200, {
				domain_suggestions: [],
				bundle_suggestion: bundleSuggestion,
				bundle_triggers: [ 'com' ],
			} );

		await fetchBundleMetadata( 'MyBrand.com' );

		expect( scope.isDone() ).toBe( true );
	} );

	it( 'normalises a missing bundle suggestion to null and missing triggers to []', async () => {
		nock( BASE ).get( '/rest/v1.1/domains/suggestions' ).query( true ).reply( 200, {
			domain_suggestions: [],
		} );

		expect( await fetchBundleMetadata( 'example' ) ).toEqual( {
			bundle_suggestion: null,
			bundle_triggers: [],
		} );
	} );
} );

describe( 'fetchBundleForDomain', () => {
	afterEach( () => nock.cleanAll() );

	it( 'requests the v2 /domains/bundle endpoint with the fqdn and returns the bundle', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/domains/bundle' )
			.query( ( query ) => query.query === 'flowers.com' )
			.reply( 200, { bundle_suggestion: bundleSuggestion } );

		const bundle = await fetchBundleForDomain( 'flowers.com' );

		expect( scope.isDone() ).toBe( true );
		expect( bundle ).toEqual( bundleSuggestion );
	} );

	it( 'lowercases the fqdn before sending it', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/domains/bundle' )
			.query( ( query ) => query.query === 'flowers.com' )
			.reply( 200, { bundle_suggestion: bundleSuggestion } );

		await fetchBundleForDomain( 'Flowers.com' );

		expect( scope.isDone() ).toBe( true );
	} );

	it( 'returns null when the endpoint carries no bundle suggestion', async () => {
		nock( BASE )
			.get( '/wpcom/v2/domains/bundle' )
			.query( true )
			.reply( 200, { bundle_suggestion: null } );

		expect( await fetchBundleForDomain( 'flowers.com' ) ).toBeNull();
	} );
} );
