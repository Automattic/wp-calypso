import range from '../range';

describe( 'range', () => {
	it( 'should create a range from 0 up to a single argument', () => {
		expect( range( 4 ) ).toEqual( [ 0, 1, 2, 3 ] );
	} );

	it( 'should create a range between start and end', () => {
		expect( range( 1, 5 ) ).toEqual( [ 1, 2, 3, 4 ] );
	} );

	it( 'should support a custom step', () => {
		expect( range( 0, 20, 5 ) ).toEqual( [ 0, 5, 10, 15 ] );
	} );

	it( 'should descend when start is greater than end', () => {
		expect( range( 4, 1 ) ).toEqual( [ 4, 3, 2 ] );
		expect( range( 0, -4 ) ).toEqual( [ 0, -1, -2, -3 ] );
	} );

	it( 'should return an empty array for an empty range', () => {
		expect( range( 0 ) ).toEqual( [] );
		expect( range( 3, 3 ) ).toEqual( [] );
	} );

	it( 'should coerce numeric-string and non-finite bounds', () => {
		// @ts-expect-error -- exercises lenient coercion for untyped callers.
		expect( range( '1', '5' ) ).toEqual( [ 1, 2, 3, 4 ] );
		expect( range( 0, NaN ) ).toEqual( [] );
		// @ts-expect-error -- see above.
		expect( range( 0, undefined ) ).toEqual( [] );
	} );

	it( 'should treat a symbol bound as 0', () => {
		// @ts-expect-error -- non-numeric bounds are coerced rather than throwing.
		expect( range( Symbol( 'x' ) ) ).toEqual( [] );
	} );

	it( 'should repeat the start value when step is 0', () => {
		expect( range( 0, 5, 0 ) ).toEqual( [ 0, 0, 0, 0, 0 ] );
	} );

	it( 'should throw on an Infinity bound', () => {
		// Infinity is coerced to MAX_INTEGER, so the resulting array length
		// is invalid for both implementations.
		expect( () => range( 0, Infinity ) ).toThrow( RangeError );
	} );
} );
