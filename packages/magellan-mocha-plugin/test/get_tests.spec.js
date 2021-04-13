const path = require( 'path' );
const chai = require( 'chai' );
const expect = chai.expect;
const Locator = require( '../lib/locator' );
const testFramework = require( '../index' );

function getTestsFrom( specs ) {
	if ( ! Array.isArray( specs ) ) {
		specs = [ specs ];
	}
	testFramework.initialize( {
		mocha_tests: specs,
		mocha_opts: path.join( specs[ 0 ], 'mocha.opts' ),
	} );
	return testFramework.iterator( { tempDir: path.resolve( '.' ) } );
}

describe( 'test iterator', function () {
	let tests;

	before( function () {
		tests = getTestsFrom( './test_support/basic' );
	} );

	it( 'finds tests', function () {
		expect( tests ).to.have.length( 2 );
	} );

	it( 'instantiates tests as Locators', function () {
		expect( tests[ 0 ] ).to.be.an.instanceOf( Locator );
	} );

	it( 'collects details of a test', function () {
		const test = tests[ 0 ];
		expect( test.name ).to.equal( 'Suite passes' );
		expect( test.title ).to.equal( 'passes' );
		expect( tests[ 0 ].filename ).to.contain( 'test_support/basic/spec.js' );
		expect( test.pending ).to.be.false;
	} );

	it( 'collects pending tests', function () {
		const test = tests[ 1 ];
		expect( test.title ).to.equal( 'contains pending' );
		expect( test.pending ).to.be.true;
	} );
} );

describe( 'test iterator plus mocha.opts', function () {
	it( 'supports coffeescript', function () {
		const tests = getTestsFrom( './test_support/coffee' );
		expect( tests ).to.have.length( 2 );
	} );

	it( 'respects grep option and ignores non-matching', function () {
		const tests = getTestsFrom( './test_support/grep' );
		expect( tests ).to.have.length( 3 );
	} );

	it( 'supports recursive collection', function () {
		const tests = getTestsFrom( './test_support/recursive' );
		expect( tests ).to.have.length( 4 );
	} );
} );
