/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import preloadImage from '../preload-image';
import useFakeDom from 'test/helpers/use-fake-dom';
import { useSandbox } from 'test/helpers/use-sinon';

describe( '#preloadImage()', function() {
	let sandbox, Image;

	useFakeDom();
	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		Image = sandbox.stub( global.window, 'Image' );
	} );

	beforeEach( function() {
		preloadImage.cache.clear();
	} );

	it( 'should load an image', function() {
		const src = 'example.jpg';

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
