/**
 * External dependencies
 */
var sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' ),
	expect = require( 'chai' ).use( sinonChai ).expect,
	memoize = require( 'lodash/function/memoize' );

/**
 * Internal dependencies
 */
var preloadImage = require( '../../preload-image' );

describe( '#preloadImage()', function() {
	var Image = sinon.stub();

	before( function() {
		global.window = { Image: Image };
	} );

	beforeEach( function() {
		Image.reset();
		preloadImage.cache = new memoize.Cache();
	} );

	after( function() {
		delete global.window;
	} );

	it( 'should load an image', function() {
		var src = 'example.jpg';

		preloadImage( src );

		expect( Image ).to.have.been.calledOnce;
		expect( Image.thisValues[ 0 ].src ).to.equal( src );
	} );

	it( 'should only load an image once per `src`', function() {
		preloadImage( 'example.jpg' );
		preloadImage( 'example.jpg' );

		expect( Image ).to.have.been.calledOnce;
	} );

	it( 'should load an image per unique `src`', function() {
		preloadImage( 'example1.jpg' );
		preloadImage( 'example2.jpg' );

		expect( Image ).to.have.been.calledTwice;
	} );
} );
