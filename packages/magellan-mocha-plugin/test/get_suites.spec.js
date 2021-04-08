/* eslint no-undef: 0, no-unused-expressions: 0, filenames/filenames: 0,
  no-magic-numbers: 0, camelcase: 0 */
'use strict';

var path = require( 'path' );
var chai = require( 'chai' );
var expect = chai.expect;
var Locator = require( '../lib/locator' );
var testFramework = require( '../index' );

function getTestsFrom( specs ) {
	if ( ! Array.isArray( specs ) ) {
		specs = [ specs ];
	}
	testFramework.initialize( {
		mocha_tests: specs,
		mocha_opts: path.join( specs[ 0 ], 'mocha.opts' ),
		suiteTag: 'suite;multiple',
	} );
	return testFramework.iterator( { tempDir: path.resolve( '.' ) } );
}

describe( 'suite iterator', function () {
	var suites;

	before( function () {
		suites = getTestsFrom( './test_support/suite' );
	} );

	it( 'finds suites', function () {
		expect( suites ).to.have.length( 3 );
	} );

	it( 'instantiates tests as Locators', function () {
		expect( suites[ 0 ] ).to.be.an.instanceOf( Locator );
	} );

	it( 'collects details of a test', function () {
		var suite = suites[ 0 ];
		expect( suite.name ).to.equal( 'Suite @suite' );
		expect( suites[ 0 ].filename ).to.contain( 'test_support/suite/spec.js' );
	} );
} );
