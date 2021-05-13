/**
 * Internal dependencies
 */
import { shuffleArray } from '../shuffle';

const TEST_ARRAY_EMPTY = [];
const TEST_ARRAY_SINGLE = [ 'foo' ];
const TEST_ARRAY_MANY = [ 'baz', 1, { foo: 'bar' }, null, true ];

describe( 'Design Picker shuffle utils', () => {
	describe( 'shuffleArray', () => {
		afterEach( () => {
			jest.resetAllMocks();
		} );

		it( 'should shuffle an array correctly', () => {
			const randomSpy = jest.spyOn( Math, 'random' ).mockImplementation( () => 0 );

			// If Math.random() always returns `0`, then the array's first item should
			// become the last item, while every other item stays in the same order.
			expect( shuffleArray( TEST_ARRAY_MANY ) ).toEqual( [
				...TEST_ARRAY_MANY.slice( 1, TEST_ARRAY_MANY.length ),
				TEST_ARRAY_MANY[ 0 ],
			] );
			expect( randomSpy ).toHaveBeenCalledTimes( TEST_ARRAY_MANY.length - 1 );
		} );

		it( 'should create a new copy of the input array', () => {
			const shuffled = shuffleArray( TEST_ARRAY_SINGLE );

			// Same array contents, but not referencing the same array value
			expect( shuffled ).toEqual( TEST_ARRAY_SINGLE );
			expect( shuffled ).not.toBe( TEST_ARRAY_SINGLE );
		} );

		it( 'should handle empty arrays', () => {
			const randomSpy = jest.spyOn( Math, 'random' );

			expect( shuffleArray( TEST_ARRAY_EMPTY ) ).toEqual( TEST_ARRAY_EMPTY );
			expect( randomSpy ).not.toHaveBeenCalled();
		} );
	} );
} );
