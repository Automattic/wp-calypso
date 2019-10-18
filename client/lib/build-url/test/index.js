/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { buildRelativeSearchUrl } from '..';

describe( 'buildRelativeSearchUrl', () => {
	test( 'should accept a path without existing query parameters', () => {
		const url = buildRelativeSearchUrl( '/path', 'terms' );

		expect( url ).to.equal( '/path?s=terms' );
	} );

	test( 'should return only the path, even if a full URL is passed', () => {
		const url = buildRelativeSearchUrl( 'https://wordpress.com/path#hash', 'terms' );

		expect( url ).to.equal( '/path?s=terms#hash' );
	} );

	test( 'should preserve existing query parameters', () => {
		const url = buildRelativeSearchUrl( '/path?param=1', 'terms' );

		expect( url ).to.equal( '/path?param=1&s=terms' );
	} );

	test( 'should override the previous search term', () => {
		const url = buildRelativeSearchUrl( '/path?s=terms', 'newterms' );

		expect( url ).to.equal( '/path?s=newterms' );
	} );

	test( 'should remove the previous search term if not searching', () => {
		const url = buildRelativeSearchUrl( '/path?s=terms', '' );

		expect( url ).to.equal( '/path' );
	} );

	test( 'should replace encoded spaces with `+`', () => {
		const url = buildRelativeSearchUrl( '/path', 'new terms' );

		expect( url ).to.equal( '/path?s=new+terms' );
	} );
} );
