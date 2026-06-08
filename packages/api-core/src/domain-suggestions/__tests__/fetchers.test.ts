import nock from 'nock';
import { fetchBundleSuggestion } from '..';
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
