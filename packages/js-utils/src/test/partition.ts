import partition from '../partition';

describe( 'partition', () => {
	it( 'splits an array by the predicate', () => {
		expect( partition( [ 1, 2, 3, 4 ], ( n ) => n % 2 === 0 ) ).toEqual( [
			[ 2, 4 ],
			[ 1, 3 ],
		] );
	} );

	it( 'iterates the values of a plain object', () => {
		const sites = {
			10: { ID: 10 },
			20: { ID: 20 },
			30: { ID: 30 },
		};
		expect( partition( sites, ( site ) => site.ID === 20 ) ).toEqual( [
			[ { ID: 20 } ],
			[ { ID: 10 }, { ID: 30 } ],
		] );
	} );

	it( 'treats a nullish collection as empty', () => {
		expect( partition( null, () => true ) ).toEqual( [ [], [] ] );
		expect( partition( undefined, () => true ) ).toEqual( [ [], [] ] );
	} );

	it( 'invokes the predicate with only the value', () => {
		// The predicate receives only the value (not the
		// index/key), so this helper does the same.
		const argCounts: number[] = [];
		partition( [ 10, 20, 30 ], ( ...args ) => {
			argCounts.push( args.length );
			return true;
		} );
		expect( argCounts ).toEqual( [ 1, 1, 1 ] );
	} );
} );
