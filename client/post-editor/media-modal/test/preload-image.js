/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import preloadImage from '../preload-image';
import { useSandbox } from 'test/helpers/use-sinon';

describe( '#preloadImage()', () => {
	let sandbox, Image;

	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		Image = sandbox.stub( global.window, 'Image' );
	} );

	beforeEach( () => {
		preloadImage.cache.clear();
	} );

	test( 'should load an image', () => {
		const src = 'example.jpg';

		preloadImage( src );

		expect( Image ).to.have.been.calledOnce;
		expect( Image ).to.have.been.calledWithNew;
		expect( Image.returnValues[ 0 ].src ).to.equal( src );
	} );

	test( 'should only load an image once per `src`', () => {
		preloadImage( 'example.jpg' );
		preloadImage( 'example.jpg' );

		expect( Image ).to.have.been.calledOnce;
	} );

	test( 'should load an image per unique `src`', () => {
		preloadImage( 'example1.jpg' );
		preloadImage( 'example2.jpg' );

		expect( Image ).to.have.been.calledTwice;
	} );
} );
