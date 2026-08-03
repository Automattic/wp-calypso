import minBy from '../min-by';

describe( 'minBy', () => {
	const data = [
		{ n: 'aa', v: 3 },
		{ n: 'bbbb', v: 1 },
		{ n: 'c', v: 7 },
	];

	it( 'returns the element with the minimum iteratee value', () => {
		expect( minBy( data, ( d ) => d.v ) ).toEqual( { n: 'bbbb', v: 1 } );
		expect( minBy( data, ( d ) => d.n.length ) ).toEqual( { n: 'c', v: 7 } );
	} );

	it( 'returns undefined for a nullish or empty array', () => {
		expect( minBy( [], ( d: { v: number } ) => d.v ) ).toBeUndefined();
		expect( minBy( null, ( d: { v: number } ) => d.v ) ).toBeUndefined();
	} );

	it( 'skips nullish and NaN iteratee values', () => {
		expect( minBy( [ { v: NaN }, { v: 5 }, { v: 2 } ], ( d ) => d.v ) ).toEqual( { v: 2 } );
	} );
} );
