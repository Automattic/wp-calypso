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
	} );
	const tempDir = await fs.mkdtemp( path.join( os.tmpdir(), 'magellan-mocha-plugin' ) );
	return testFramework.iterator( { tempDir } );
}

describe( 'test iterator', function () {
	let tests;

	beforeAll( async function () {
		tests = await getTestsFrom( path.join( __dirname, '../test_support/basic' ) );
	} );

	it( 'finds tests', function () {
		expect( tests ).toHaveLength( 2 );
	} );

	it( 'instantiates tests as Locators', function () {
		expect( tests[ 0 ] ).toBeInstanceOf( Locator );
	} );

	it( 'collects details of a test', function () {
		const test = tests[ 0 ];
		expect( test.name ).toBe( 'Suite passes' );
		expect( test.title ).toBe( 'passes' );
		expect( tests[ 0 ].filename ).toEqual(
			expect.stringContaining( 'test_support/basic/spec.js' )
		);
		expect( test.pending ).toBe( false );
	} );

	it( 'collects pending tests', function () {
		const test = tests[ 1 ];
		expect( test.title ).toBe( 'contains pending' );
		expect( test.pending ).toBe( true );
	} );
} );

describe( 'test iterator plus .mocharc.js', function () {
	it( 'supports coffeescript', async function () {
		const tests = await getTestsFrom( path.join( __dirname, '../test_support/coffee' ) );
		expect( tests ).toHaveLength( 2 );
	} );

	it( 'respects grep option and ignores non-matching', async function () {
		const tests = await getTestsFrom( path.join( __dirname, '../test_support/grep' ) );
		expect( tests ).toHaveLength( 3 );
	} );

	it( 'supports recursive collection', async function () {
		const tests = await getTestsFrom( path.join( __dirname, '../test_support/recursive' ) );
		expect( tests ).toHaveLength( 4 );
	} );
} );
