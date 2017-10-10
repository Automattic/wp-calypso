/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import buildUrl from '..';

describe( 'build-url', () => {
	test( 'should accept a path without existing query parameters', () => {
		const url = buildUrl( '/path', 'terms' );

		expect( url ).to.equal( '/path?s=terms' );
	} );

	test( 'should return only the path, even if a full URL is passed', () => {
		const url = buildUrl( 'https://wordpress.com/path#hash', 'terms' );

		expect( url ).to.equal( '/path?s=terms#hash' );
	} );

	test( 'should preserve existing query parameters', () => {
		const url = buildUrl( '/path?param=1', 'terms' );

		expect( url ).to.equal( '/path?param=1&s=terms' );
	} );

	test( 'should override the previous search term', () => {
		const url = buildUrl( '/path?s=terms', 'newterms' );

		expect( url ).to.equal( '/path?s=newterms' );
	} );

	test( 'should remove the previous search term if not searching', () => {
		const url = buildUrl( '/path?s=terms', '' );

		expect( url ).to.equal( '/path' );
	} );

	test( 'should replace encoded spaces with `+`', () => {
		const url = buildUrl( '/path', 'new terms' );

		expect( url ).to.equal( '/path?s=new+terms' );
	} );
} );
