import maxBy from '../max-by';

describe( 'maxBy', () => {
	const data = [
		{ n: 'aa', v: 3 },
		{ n: 'bbbb', v: 1 },
		{ n: 'c', v: 7 },
	];

	it( 'returns the element with the maximum iteratee value', () => {
		expect( maxBy( data, ( d ) => d.v ) ).toEqual( { n: 'c', v: 7 } );
		expect( maxBy( data, ( d ) => d.n.length ) ).toEqual( { n: 'bbbb', v: 1 } );
	} );

	it( 'returns undefined for a nullish or empty array', () => {
		expect( maxBy( [], ( d: { v: number } ) => d.v ) ).toBeUndefined();
		expect( maxBy( null, ( d: { v: number } ) => d.v ) ).toBeUndefined();
	} );

	it( 'skips nullish and NaN iteratee values', () => {
		expect( maxBy( [ { v: NaN }, { v: 2 }, { v: 5 } ], ( d ) => d.v ) ).toEqual( { v: 5 } );
		expect( maxBy( [ { v: undefined }, { v: 2 } ], ( d ) => d.v ) ).toEqual( { v: 2 } );
	} );
} );
