/**
 * External dependencies
 */
const expect = require( 'chai' ).expect;

/**
 * Internal Dependencies
 */
const safeImage = require( '../' );

describe( 'index', function() {
	it( 'should ignore a relative url', function() {
		expect( safeImage( '/foo' ) ).to.eql( '/foo' );
	} );

	it( 'should make a non-wpcom http url safe', function() {
		expect( safeImage( 'http://example.com/foo' ) ).to.eql( 'https://i1.wp.com/example.com/foo' );
	} );

	it( 'should make a non-wpcom https url safe', function() {
		expect( safeImage( 'https://example.com/foo' ) ).to.eql( 'https://i1.wp.com/example.com/foo?ssl=1' );
	} );

	it( 'should make wp-com like subdomain url safe', function() {
		expect( safeImage( 'https://wordpress.com.example.com/foo' ) ).to.eql(
			'https://i0.wp.com/wordpress.com.example.com/foo?ssl=1'
		);
	} );

	it( 'should make domain ending by wp-com url safe', function() {
		expect( safeImage( 'https://examplewordpress.com/foo' ) ).to.eql(
			'https://i0.wp.com/examplewordpress.com/foo?ssl=1'
		);
	} );

	it( 'should make a non-wpcom protocol relative url safe', function() {
		expect( safeImage( '//example.com/foo' ) ).to.eql( 'https://i1.wp.com/example.com/foo' );
	} );

	it( 'should promote an http wpcom url to https', function() {
		expect( safeImage( 'http://files.wordpress.com/' ) ).to.eql( 'https://files.wordpress.com/' );
		expect( safeImage( 'http://wordpress.com/' ) ).to.eql( 'https://wordpress.com/' );
	} );

	it( 'should leave https wpcom url alone', function() {
		expect( safeImage( 'https://files.wordpress.com/' ) ).to.eql( 'https://files.wordpress.com/' );
		expect( safeImage( 'https://wordpress.com/' ) ).to.eql( 'https://wordpress.com/' );
		expect( safeImage( 'https://blog-en.files.wordpress.com/' ) ).to.eql( 'https://blog-en.files.wordpress.com/' );
	} );

	it( 'should promote an http gravatar url to https', function() {
		expect( safeImage( 'http://files.gravatar.com/' ) ).to.eql( 'https://files.gravatar.com/' );
		expect( safeImage( 'http://gravatar.com/' ) ).to.eql( 'https://gravatar.com/' );
	} );

	it( 'should leave https gravatar url alone', function() {
		expect( safeImage( 'https://files.gravatar.com/' ) ).to.eql( 'https://files.gravatar.com/' );
		expect( safeImage( 'https://gravatar.com/' ) ).to.eql( 'https://gravatar.com/' );
	} );

	it( 'should strip querystrings from non-wp images before trying to make them safe', function() {
		expect( safeImage( 'https://example.com/foo?bar' ) ).to.eql( 'https://i1.wp.com/example.com/foo?ssl=1' );
		expect( safeImage( 'https://example.com/foo.jpg?bar' ) ).to.eql( 'https://i0.wp.com/example.com/foo.jpg?ssl=1' );
		expect( safeImage( 'https://example.com/foo.jpeg?bar' ) ).to.eql( 'https://i0.wp.com/example.com/foo.jpeg?ssl=1' );
		expect( safeImage( 'https://example.com/foo.gif?bar' ) ).to.eql( 'https://i2.wp.com/example.com/foo.gif?ssl=1' );
		expect( safeImage( 'https://example.com/foo.png?bar' ) ).to.eql( 'https://i0.wp.com/example.com/foo.png?ssl=1' );
	} );
} );
