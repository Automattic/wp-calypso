import { filterDesignsByCategory, gatherCategories } from '..';
import type { Design } from '../../types';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: () => false,
} ) );

const testDesign: Design = {
	title: 'Mock',
	slug: 'mock-design-slug',
	template: 'mock-design-template',
	theme: 'mock-design-theme',
	fonts: {
		headings: 'Arvo',
		base: 'Cabin',
	},
	categories: [ { slug: 'featured', name: 'Featured' } ],
	features: [],
};

describe( 'gatherCategories', () => {
	it( 'returns no categories when there are no designs', () => {
		expect( gatherCategories( [] ) ).toHaveLength( 0 );
	} );

	it( 'merges categories when the slugs match', () => {
		const categories = gatherCategories( [
			// Repeating the two "cat" category objects to ensure they don't have object equality
			{ ...testDesign, categories: [ { slug: 'cat', name: 'Cat' } ] },
			{
				...testDesign,
				categories: [
					{ slug: 'cat', name: 'Cat' },
					{ slug: 'dog', name: 'Dog' },
				],
			},
			{ ...testDesign, categories: [] },
		] );

		expect( categories ).toEqual(
			expect.arrayContaining( [
				{ slug: 'cat', name: 'Cat' },
				{ slug: 'dog', name: 'Dog' },
			] )
		);
	} );

	it( 'returns no categories when designs have no categories', () => {
		const designWithNoCategory = { ...testDesign, categories: [] };
		expect( gatherCategories( [ designWithNoCategory, designWithNoCategory ] ) ).toHaveLength( 0 );
	} );
} );

describe( 'filterDesignsByCategory', () => {
	it( 'returns no designs when there are no designs', () => {
		expect( filterDesignsByCategory( [], 'anything' ) ).toHaveLength( 0 );
	} );

	it( 'returns the exact same designs array no category slug is given', () => {
		const designs = [ testDesign, testDesign ];
		expect( filterDesignsByCategory( designs, null ) ).toBe( designs );
	} );

	it( 'returns no designs when no designs match the category slug', () => {
		expect( filterDesignsByCategory( [ testDesign, testDesign ], 'no-match' ) ).toHaveLength( 0 );
	} );

	it( 'returns all designs when all designs match the category', () => {
		expect( filterDesignsByCategory( [ testDesign, testDesign ], 'featured' ) ).toEqual( [
			testDesign,
			testDesign,
		] );
	} );

	it( 'returns some designs when designs match the category slug', () => {
		const catDesign = {
			...testDesign,
			categories: [ ...testDesign.categories, { slug: 'cat', name: 'Cat' } ],
		};
		const result = filterDesignsByCategory( [ testDesign, catDesign ], 'cat' );

		expect( result ).toHaveLength( 1 );
		// Assert that the design has object equality with the design passed in
		expect( result[ 0 ] ).toBe( catDesign );
	} );
} );
