import nock from 'nock';
import { fetchBundleForDomain, fetchBundleSuggestion, fetchBundleTriggers } from '..';
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

describe( 'fetchBundleSuggestion', () => {
	afterEach( () => nock.cleanAll() );

	it( 'requests /domains/suggestions with with_bundles=1 and returns the bundle portion', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.1/domains/suggestions' )
			.query( ( query ) => query.with_bundles === '1' && query.query === 'example' )
			.reply( 200, {
				domain_suggestions: [],
				bundle_suggestion: bundleSuggestion,
			} );

		const bundle = await fetchBundleSuggestion( 'example' );

		expect( scope.isDone() ).toBe( true );
		expect( bundle ).toEqual( bundleSuggestion );
	} );

	it( 'lowercases the query before sending it', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.1/domains/suggestions' )
			.query( ( query ) => query.query === 'mybrand.com' )
			.reply( 200, {
				domain_suggestions: [],
				bundle_suggestion: bundleSuggestion,
			} );

		await fetchBundleSuggestion( 'MyBrand.com' );

		expect( scope.isDone() ).toBe( true );
	} );

	it( 'returns null when the response carries no bundle suggestion', async () => {
		nock( BASE ).get( '/rest/v1.1/domains/suggestions' ).query( true ).reply( 200, {
			domain_suggestions: [],
			bundle_suggestion: null,
		} );

		expect( await fetchBundleSuggestion( 'example' ) ).toBeNull();
	} );
} );

describe( 'fetchBundleTriggers', () => {
	afterEach( () => nock.cleanAll() );

	it( 'requests with_bundles=1 and returns the bundle_triggers list', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.1/domains/suggestions' )
			.query( ( query ) => query.with_bundles === '1' && query.query === 'example' )
			.reply( 200, {
				domain_suggestions: [],
				bundle_suggestion: null,
				bundle_triggers: [ 'com' ],
			} );

		const triggers = await fetchBundleTriggers( 'example' );

		expect( scope.isDone() ).toBe( true );
		expect( triggers ).toEqual( [ 'com' ] );
	} );

	it( 'returns an empty array when the response carries no triggers', async () => {
		nock( BASE ).get( '/rest/v1.1/domains/suggestions' ).query( true ).reply( 200, {
			domain_suggestions: [],
			bundle_suggestion: null,
		} );

		expect( await fetchBundleTriggers( 'example' ) ).toEqual( [] );
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
