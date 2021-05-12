const testFramework = require( '../index' );
const filters = testFramework.filters;
const tests = [ 'a', 'b', 'b/x', 'c', 'd' ].map( function ( f ) {
	return { filename: f + '/spec.js' };
} );

describe( 'group filter', function () {
	it( 'returns all tests when no partial given', function () {
		const filtered = filters.group( tests );
		expect( filtered ).toBe( tests );
	} );

	it( 'filters by a single partial', function () {
		const filtered = filters.group( tests, 'b' );
		expect( filtered ).toHaveLength( 2 );
		expect( filtered[ 1 ] ).toHaveProperty( 'filename', 'b/x/spec.js' );
	} );

	it( 'filters by multiple partials', function () {
		const filtered = filters.group( tests, [ 'b', 'd' ] );
		expect( filtered ).toHaveLength( 3 );
		expect( filtered[ 2 ] ).toHaveProperty( 'filename', 'd/spec.js' );
	} );
} );
