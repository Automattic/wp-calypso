/**
 * External dependencies
 */
import { expect } from 'chai';

describe( 'safeImageUrl()', () => {
	let safeImageUrl;

	function commonTests() {
		it( 'should ignore a relative url', () => {
			expect( safeImageUrl( '/foo' ) ).to.equal( '/foo' );
		} );

		it( 'should ignore a data url', () => {
			const dataImageUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
			expect( safeImageUrl( dataImageUrl ) ).to.equal( dataImageUrl );
		} );

		it( 'should make a non-whitelisted protocol safe', () => {
			[ 'javascript:alert("foo")', 'data:application/json;base64,', 'about:config' ].forEach( ( url ) => {
				expect( safeImageUrl( url ) ).to.match( /^https:\/\/i[0-2]\.wp.com\// );
			} );
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

		it( 'should make safe variations of urls testing extremes of safe patterns', () => {
			expect( [
				'https://examplewordpress.com/foo',
				'https://wordpresscom/foo',
				'https://wordpress.com.example.com/foo'
			].map( safeImageUrl ) ).to.eql( [
				'https://i0.wp.com/examplewordpress.com/foo?ssl=1',
				'https://i0.wp.com/wordpresscom/foo?ssl=1',
				'https://i0.wp.com/wordpress.com.example.com/foo?ssl=1'
			] );
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
	}

	context( 'browser', () => {
		before( () => {
			global.location = { origin: 'https://wordpress.com' };
			delete require.cache[ require.resolve( '../' ) ];
			safeImageUrl = require( '../' );
		} );

		after( () => {
			delete global.location;
			delete require.cache[ require.resolve( '../' ) ];
		} );

		it( 'should ignore a blob url for current origin', () => {
			const originalUrl = 'blob:https://wordpress.com/ddd1d6b0-f31b-4937-ae9e-97f1d660cf71';
			expect( safeImageUrl( originalUrl ) ).to.equal( originalUrl );
		} );

		it( 'should make a blob url for other origin safe', () => {
			const originalUrl = 'blob:http://example.com/ddd1d6b0-f31b-4937-ae9e-97f1d660cf71';
			const expectedUrl = 'https://i1.wp.com/http//example.com/ddd1d6b0-f31b-4937-ae9e-97f1d660cf71';
			expect( safeImageUrl( originalUrl ) ).to.equal( expectedUrl );
		} );

		commonTests();
	} );

	context( 'node', () => {
		before( () => {
			safeImageUrl = require( '../' );
		} );

		it( 'should make a blob url safe', () => {
			const originalUrl = 'blob:http://example.com/ddd1d6b0-f31b-4937-ae9e-97f1d660cf71';
			const expectedUrl = 'https://i1.wp.com/http//example.com/ddd1d6b0-f31b-4937-ae9e-97f1d660cf71';
			expect( safeImageUrl( originalUrl ) ).to.equal( expectedUrl );
		} );

		commonTests();
	} );
} );
