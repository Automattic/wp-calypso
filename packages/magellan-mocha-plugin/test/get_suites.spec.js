const path = require( 'path' );
const Locator = require( '../lib/locator' );
const testFramework = require( '../index' );

function getTestsFrom( specs ) {
	if ( ! Array.isArray( specs ) ) {
		specs = [ specs ];
	}
	testFramework.initialize( {
		mocha_tests: specs,
		mocha_config: path.join( specs[ 0 ], '.mocharc.js' ),
		suiteTag: 'suite;multiple',
	} );
	return testFramework.iterator( { tempDir: path.resolve( '.' ) } );
}

describe( 'suite iterator', function () {
	let suites;

	beforeEach( function () {
		suites = getTestsFrom( path.join( __dirname, '../test_support/suite' ) );
	} );

	it( 'finds suites', function () {
		expect( suites ).toHaveLength( 3 );
	} );

	it( 'instantiates tests as Locators', function () {
		expect( suites[ 0 ] ).toBeInstanceOf( Locator );
	} );

	it( 'collects details of a test', function () {
		const suite = suites[ 0 ];
		expect( suite.name ).toBe( 'Suite @suite' );
		expect( suites[ 0 ].filename ).toEqual( expect.stringMatching( 'test_support/suite/spec.js' ) );
	} );
} );
