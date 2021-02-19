/**
 * Internal dependencies
 */
import { getCategoryWithFallbacks } from '.';

jest.mock( '@wordpress/blocks', () => ( {
	getCategories: () => [ { slug: 'foobar' }, { slug: 'barfoo' } ],
} ) );

describe( 'getCategoryWithFallbacks', () => {
	describe( 'single category passed', () => {
		it( 'returns the category if it exists', () => {
			expect( getCategoryWithFallbacks( 'foobar' ) ).toBe( 'foobar' );
		} );
		it( 'throws an error if it does not exist', () => {
			expect( () => getCategoryWithFallbacks( 'nah' ) ).toThrow( /nah/ );
		} );
	} );

	describe( 'multiple categories are passed', () => {
		it( 'throws an error if none of the categories exist', () => {
			expect( () => getCategoryWithFallbacks( 'nah', 'meh', 'wut', 'foo' ) ).toThrow(
				/nah,meh,wut,foo/
			);
		} );

		it( 'ignores all unexisting categories until it finds the *first one* that exists, then returns it', () => {
			expect( getCategoryWithFallbacks( 'foobar', 'meh', 'barfoo' ) ).toBe( 'foobar' );
			expect( getCategoryWithFallbacks( 'nah', 'foobar', 'barfoo', 'foo' ) ).toBe( 'foobar' );
			expect( getCategoryWithFallbacks( 'nah', 'meh', 'foobar' ) ).toBe( 'foobar' );
		} );
	} );
} );
