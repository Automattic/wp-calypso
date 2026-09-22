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
			result_set_id: null,
		} );
	} );

	it( 'passes the analytics context as request params', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.1/domains/suggestions' )
			.query(
				( query ) =>
					query.flow_name === 'onboarding' &&
					query.section === 'signup' &&
					query.search_id === 'search-1'
			)
			.reply( 200, { domain_suggestions: [] } );

		await fetchBundleMetadata( 'example', {
			flow_name: 'onboarding',
			section: 'signup',
			search_id: 'search-1',
		} );

		expect( scope.isDone() ).toBe( true );
	} );

	it( 'reads the top-level result_set_id, falling back to the first suggestion', async () => {
		nock( BASE )
			.get( '/rest/v1.1/domains/suggestions' )
			.query( true )
			.reply( 200, {
				domain_suggestions: [ { domain_name: 'example.com', result_set_id: 'item-id' } ],
				result_set_id: 'top-level-id',
			} );

		expect( ( await fetchBundleMetadata( 'example' ) ).result_set_id ).toBe( 'top-level-id' );

		nock( BASE )
			.get( '/rest/v1.1/domains/suggestions' )
			.query( true )
			.reply( 200, {
				domain_suggestions: [ { domain_name: 'example.com', result_set_id: 'item-id' } ],
			} );

		expect( ( await fetchBundleMetadata( 'example' ) ).result_set_id ).toBe( 'item-id' );
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

	it( 'sends the plain suggestion defaults so the wrapped request matches the plain one', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.1/domains/suggestions' )
			.query(
				( query ) =>
					query.with_bundles === '1' &&
					query.include_wordpressdotcom === 'false' &&
					query.include_dotblogsubdomain === 'false' &&
					query.only_wordpressdotcom === 'false' &&
					query.quantity === '5' &&
					query.vendor === 'variation2_front' &&
					query.query === 'example'
			)
			.reply( 200, { domain_suggestions: [], bundle_suggestion: null, bundle_triggers: [] } );

		await fetchBundleMetadata( 'example' );

		expect( scope.isDone() ).toBe( true );
	} );

	it( 'forwards caller params over the defaults', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.1/domains/suggestions' )
			.query(
				( query ) =>
					query.with_bundles === '1' &&
					query.quantity === '30' &&
					query.vendor === 'ciab' &&
					query.exact_sld_matches_only === 'true' &&
					query.query === 'example'
			)
			.reply( 200, { domain_suggestions: [], bundle_suggestion: null, bundle_triggers: [] } );

		await fetchBundleMetadata( 'example', {
			quantity: 30,
			vendor: 'ciab',
			exact_sld_matches_only: true,
		} );

		expect( scope.isDone() ).toBe( true );
	} );

	it( 'normalises a missing bundle suggestion to null and missing triggers to []', async () => {
		nock( BASE ).get( '/rest/v1.1/domains/suggestions' ).query( true ).reply( 200, {
			domain_suggestions: [],
		} );

		expect( await fetchBundleMetadata( 'example' ) ).toEqual( {
			bundle_suggestion: null,
			bundle_triggers: [],
			result_set_id: null,
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

	it( 'passes the analytics context as request params', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/domains/bundle' )
			.query(
				( query ) =>
					query.query === 'flowers.com' &&
					query.flow_name === 'domain' &&
					query.section === 'domain-first' &&
					query.search_id === 'search-1'
			)
			.reply( 200, { bundle_suggestion: null } );

		await fetchBundleForDomain( 'flowers.com', {
			flow_name: 'domain',
			section: 'domain-first',
			search_id: 'search-1',
		} );

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
