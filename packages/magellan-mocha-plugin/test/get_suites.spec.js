const path = require( 'path' );
const Locator = require( '../lib/locator' );
const testFramework = require( '../index' );
const fs = require( 'fs' ).promises;
const os = require( 'os' );

async function getTestsFrom( specs ) {
	if ( ! Array.isArray( specs ) ) {
		specs = [ specs ];
	}
	testFramework.initialize( {
		mocha_tests: specs,
		mocha_config: path.join( specs[ 0 ], '.mocharc.js' ),
		suiteTag: 'suite;multiple',
	} );
	const tempDir = await fs.mkdtemp( path.join( os.tmpdir(), 'magellan-mocha-plugin' ) );
	return testFramework.iterator( { tempDir } );
}

describe( 'suite iterator', function () {
	let suites;

	beforeAll( async function () {
		suites = await getTestsFrom( path.join( __dirname, '../test_support/suite' ) );
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
