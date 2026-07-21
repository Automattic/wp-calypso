import times from '../times';

describe( 'times', () => {
	it( 'should invoke the iteratee `n` times with the index', () => {
		expect( times( 3, ( i ) => i * 2 ) ).toEqual( [ 0, 2, 4 ] );
	} );

	it( 'should return an empty array for `n` <= 0', () => {
		expect( times( 0, ( i ) => i ) ).toEqual( [] );
		expect( times( -2, ( i ) => i ) ).toEqual( [] );
	} );

	it( 'should floor a non-integer `n`', () => {
		expect( times( 3.9, ( i ) => i ) ).toEqual( [ 0, 1, 2 ] );
	} );
} );
