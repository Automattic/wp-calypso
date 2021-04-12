const chai = require( 'chai' );
const expect = chai.expect;
const testFramework = require( '../index' );
const tagFilter = require( '../lib/tag_filter' );
const filters = testFramework.filters;
const tests = [ 'a @foo', 'b', 'c @bar', 'd @bar', 'e @foo @bar' ].map( function ( n ) {
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
		const filtered = filters.tag( tests, 'bar' );
		expect( filtered ).to.have.length( 3 );
		expect( filtered[ 0 ] ).to.have.property( 'name' ).that.equals( 'c @bar' );
	} );

	it( 'matches multiple tags in string', function () {
		const filtered = filters.tag( tests, 'bar , foo' );
		expect( filtered ).to.have.length( 1 );
	} );

	it( 'matches tags array', function () {
		const filtered = filters.tag( tests, [ 'bar', 'foo' ] );
		expect( filtered ).to.have.length( 1 );
	} );
} );
