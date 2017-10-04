/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import buildUrl from '..';

describe( 'build-url', function() {
	it( 'should accept a path without existing query parameters', function() {
		const url = buildUrl( '/path', 'terms' );

		expect( url ).to.equal( '/path?s=terms' );
	} );

	it( 'should return only the path, even if a full URL is passed', function() {
		const url = buildUrl( 'https://wordpress.com/path#hash', 'terms' );

		expect( url ).to.equal( '/path?s=terms#hash' );
	} );

	it( 'should preserve existing query parameters', function() {
		const url = buildUrl( '/path?param=1', 'terms' );

		expect( url ).to.equal( '/path?param=1&s=terms' );
	} );

	it( 'should override the previous search term', function() {
		const url = buildUrl( '/path?s=terms', 'newterms' );

		expect( url ).to.equal( '/path?s=newterms' );
	} );

	it( 'should remove the previous search term if not searching', function() {
		const url = buildUrl( '/path?s=terms', '' );

		expect( url ).to.equal( '/path' );
	} );

	it( 'should replace encoded spaces with `+`', function() {
		const url = buildUrl( '/path', 'new terms' );

		expect( url ).to.equal( '/path?s=new+terms' );
	} );
} );
