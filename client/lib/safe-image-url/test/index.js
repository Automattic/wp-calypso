/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import safeImageUrl from '../';

describe( 'safeImageUrl()', () => {
	it( 'should ignore a relative url', () => {
		expect( safeImageUrl( '/foo' ) ).to.equal( '/foo' );
	} );

	it( 'should make a non-wpcom http url safe', () => {
		expect( safeImageUrl( 'http://example.com/foo' ) ).to.equal( 'https://i1.wp.com/example.com/foo' );
	} );

	it( 'should make a non-wpcom https url safe', () => {
		expect( safeImageUrl( 'https://example.com/foo' ) ).to.equal( 'https://i1.wp.com/example.com/foo?ssl=1' );
	} );

	it( 'should make wp-com like subdomain url safe', () => {
		expect( safeImageUrl( 'https://wordpress.com.example.com/foo' ) ).to.equal(
			'https://i0.wp.com/wordpress.com.example.com/foo?ssl=1'
		);
	} );

	it( 'should make domain ending by wp-com url safe', () => {
		expect( safeImageUrl( 'https://examplewordpress.com/foo' ) ).to.equal(
			'https://i0.wp.com/examplewordpress.com/foo?ssl=1'
		);
	} );

	it( 'should make a non-wpcom protocol relative url safe', () => {
		expect( safeImageUrl( '//example.com/foo' ) ).to.equal( 'https://i1.wp.com/example.com/foo' );
	} );

	it( 'should promote an http wpcom url to https', () => {
		expect( safeImageUrl( 'http://files.wordpress.com/' ) ).to.equal( 'https://files.wordpress.com/' );
		expect( safeImageUrl( 'http://wordpress.com/' ) ).to.equal( 'https://wordpress.com/' );
	} );

	it( 'should leave https wpcom url alone', () => {
		expect( safeImageUrl( 'https://files.wordpress.com/' ) ).to.equal( 'https://files.wordpress.com/' );
		expect( safeImageUrl( 'https://wordpress.com/' ) ).to.equal( 'https://wordpress.com/' );
		expect( safeImageUrl( 'https://blog-en.files.wordpress.com/' ) ).to.equal( 'https://blog-en.files.wordpress.com/' );
	} );

	it( 'should promote an http gravatar url to https', () => {
		expect( safeImageUrl( 'http://files.gravatar.com/' ) ).to.equal( 'https://files.gravatar.com/' );
		expect( safeImageUrl( 'http://gravatar.com/' ) ).to.equal( 'https://gravatar.com/' );
	} );

	it( 'should leave https gravatar url alone', () => {
		expect( safeImageUrl( 'https://files.gravatar.com/' ) ).to.equal( 'https://files.gravatar.com/' );
		expect( safeImageUrl( 'https://gravatar.com/' ) ).to.equal( 'https://gravatar.com/' );
	} );

	it( 'should return null for urls with querystrings', () => {
		expect( safeImageUrl( 'https://example.com/foo?bar' ) ).to.be.null;
		expect( safeImageUrl( 'https://example.com/foo.jpg?bar' ) ).to.be.null;
		expect( safeImageUrl( 'https://example.com/foo.jpeg?bar' ) ).to.be.null;
		expect( safeImageUrl( 'https://example.com/foo.gif?bar' ) ).to.be.null;
		expect( safeImageUrl( 'https://example.com/foo.png?bar' ) ).to.be.null;
	} );
} );
