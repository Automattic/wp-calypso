/* eslint no-undef: 0, no-unused-expressions: 0, filenames/filenames: 0,
   no-magic-numbers: 0 */
'use strict';

var chai = require( 'chai' );
var expect = chai.expect;
var testFramework = require( '../index' );
var tagFilter = require( '../lib/tag_filter' );
var filters = testFramework.filters;
var tests = [ 'a @foo', 'b', 'c @bar', 'd @bar', 'e @foo @bar' ].map( function ( n ) {
	return { name: n };
} );

describe( 'tag filter', function () {
	it( 'is offered on both tag and tags', function () {
		expect( filters.tag ).to.equal( filters.tags );
	} );

	it( 'handle no array', function () {
		filters.tag( tests, 'bar' );
		expect( tagFilter( [ { a: 1 } ], null ) ).to.eql( [ { a: 1 } ] );
	} );

	it( 'matches a single tag string', function () {
		var filtered = filters.tag( tests, 'bar' );
		expect( filtered ).to.have.length( 3 );
		expect( filtered[ 0 ] ).to.have.property( 'name' ).that.equals( 'c @bar' );
	} );

	it( 'matches multiple tags in string', function () {
		var filtered = filters.tag( tests, 'bar , foo' );
		expect( filtered ).to.have.length( 1 );
	} );

	it( 'matches tags array', function () {
		var filtered = filters.tag( tests, [ 'bar', 'foo' ] );
		expect( filtered ).to.have.length( 1 );
	} );
} );
