/**
 * Internal dependencies
 */
import { insertAt, moveTo } from '../array';

describe( 'array', () => {
	describe( 'insertAt', () => {
		it( 'should insert a unique item at a given position', () => {
			const array = [ 'a', 'b', 'd' ];
			expect( insertAt( array, 'c', 2 ) ).toEqual(
				[ 'a', 'b', 'c', 'd' ]
			);
		} );

		it( 'should insert multiple items at a given position', () => {
			const array = [ 'a', 'b', 'e' ];
			expect( insertAt( array, [ 'c', 'd' ], 2 ) ).toEqual(
				[ 'a', 'b', 'c', 'd', 'e' ]
			);
		} );
	} );

	describe( 'moveTo', () => {
		it( 'should move an item to a given position', () => {
			const array = [ 'a', 'b', 'd', 'c' ];
			expect( moveTo( array, 3, 2 ) ).toEqual(
				[ 'a', 'b', 'c', 'd' ]
			);
		} );

		it( 'should move an item upwards to a given position', () => {
			const array = [ 'b', 'a', 'c', 'd' ];
			expect( moveTo( array, 0, 1 ) ).toEqual(
				[ 'a', 'b', 'c', 'd' ]
			);
		} );

		it( 'should move multiple items to a given position', () => {
			const array = [ 'a', 'c', 'd', 'b', 'e' ];
			expect( moveTo( array, 1, 2, 2 ) ).toEqual(
				[ 'a', 'b', 'c', 'd', 'e' ]
			);
		} );
	} );
} );
