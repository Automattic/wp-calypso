/* eslint no-undef: 0, no-unused-expressions: 0, filenames/filenames: 0 */
'use strict';

var path = require( 'path' );
var sinon = require( 'sinon' );
var chai = require( 'chai' );
var expect = chai.expect;
var testFramework = require( '../index' );
var filters = testFramework.filters;
var tests = [];

'a b c'.split( ' ' ).forEach( function ( f ) {
	// create two tests per file
	for ( var i = 0; i < 2; i++ ) {
		tests.push( { filename: 'path/to/' + f + '.js' } );
	}
} );

describe( 'single test filter', function () {
	beforeEach( function () {
		sinon.stub( path, 'resolve', function ( p ) {
			return p;
		} );
	} );

	afterEach( function () {
		path.resolve.restore();
	} );

	it( 'returns the tests matching the given file', function () {
		var filtered = filters.test( tests, 'path/to/b.js' );
		expect( filtered ).to.have.length( 2 );
		expect( filtered[ 0 ] ).to.have.property( 'filename' ).that.equals( 'path/to/b.js' );
	} );
} );
