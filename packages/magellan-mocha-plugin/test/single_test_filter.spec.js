const testFramework = require( '../index' );
const filters = testFramework.filters;
const tests = [];

'a b c'.split( ' ' ).forEach( function ( f ) {
	// create two tests per file
	for ( let i = 0; i < 2; i++ ) {
		tests.push( { filename: 'path/to/' + f + '.js' } );
	}
} );

describe( 'single test filter', function () {
	it( 'returns the tests matching the given file', function () {
		const filtered = filters.test( tests, 'path/to/b.js' );
		expect( filtered ).toHaveLength( 2 );
		expect( filtered[ 0 ] ).toHaveProperty( 'filename', 'path/to/b.js' );
	} );
} );
