import { fetchBundleSuggestion } from '..';

describe( 'fetchBundleSuggestion', () => {
	it( 'returns a bundle suggestion shaped like the with_bundles payload', async () => {
		const bundle = await fetchBundleSuggestion( 'example' );

		expect( bundle ).not.toBeNull();
		expect( bundle?.sld ).toBe( 'example' );
		expect( bundle?.domains.length ).toBeGreaterThanOrEqual( 2 );

		bundle?.domains.forEach( ( domain ) => {
			expect( domain.domain.startsWith( 'example.' ) ).toBe( true );
			expect( typeof domain.cost ).toBe( 'string' );
			expect( typeof domain.raw_price ).toBe( 'number' );
			expect( typeof domain.product_slug ).toBe( 'string' );
		} );

		expect( typeof bundle?.bundle_price ).toBe( 'number' );
		expect( typeof bundle?.original_price ).toBe( 'number' );
		expect( typeof bundle?.discount_percent ).toBe( 'number' );
		expect( typeof bundle?.category ).toBe( 'string' );
		expect( typeof bundle?.bundle_id ).toBe( 'string' );
		expect( typeof bundle?.bundle_group_id ).toBe( 'string' );
		expect( typeof bundle?.catalogue_version ).toBe( 'string' );
	} );

	it( 'derives the sld from a full-domain query', async () => {
		const bundle = await fetchBundleSuggestion( 'MyBrand.com' );

		expect( bundle?.sld ).toBe( 'mybrand' );
		expect( bundle?.domains[ 0 ].domain ).toBe( 'mybrand.com' );
	} );

	it( 'returns null for an empty query', async () => {
		expect( await fetchBundleSuggestion( '' ) ).toBeNull();
		expect( await fetchBundleSuggestion( '   ' ) ).toBeNull();
	} );
} );
