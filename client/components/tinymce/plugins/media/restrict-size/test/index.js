/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';

describe( 'restrictSize', () => {
	let getMaxWidth, resetImages, setImages;

	beforeAll( () => {
		const restrictSize = require( '../' );
		getMaxWidth = restrictSize.getMaxWidth;
		resetImages = restrictSize.resetImages;
		setImages = restrictSize.setImages;
	} );

	describe( '#getMaxWidth()', () => {
		let matchMedia, devicePixelRatio;
		beforeAll( () => {
			matchMedia = window.matchMedia;
			devicePixelRatio = window.devicePixelRatio;
		} );

		afterEach( () => {
			window.devicePixelRatio = devicePixelRatio;
			window.matchMedia = matchMedia;
		} );

		test( 'should return the multiple of the root device ratio if available', () => {
			window.devicePixelRatio = 1.5;

			expect( getMaxWidth() ).to.equal( 1020 );
		} );

		test( 'should return twice the base if the device resolution matches the retina media query', () => {
			window.devicePixelRatio = undefined;
			window.matchMedia = () => ( { matches: true } );

			expect( getMaxWidth() ).to.equal( 1360 );
		} );

		test( 'should return the base max width if the device is not retina-capable', () => {
			window.devicePixelRatio = undefined;
			expect( getMaxWidth() ).to.equal( 680 );
		} );
	} );

	describe( '#resetImages()', () => {
		test( 'should restore all instances of replaced images', () => {
			const value = resetImages(
				'<p><img src="https://wordpress.com/2015/11/forest.jpg?w=680" data-wpmedia-src="https://wordpress.com/2015/11/forest.jpg?w=1024" class="alignnone size-large wp-image-5823" alt="forest" width="1024" height="683" data-mce-src="https://wordpress.com/2015/11/forest.jpg?w=680" data-mce-selected="1"></p>'
			);
			expect( value ).to.equal(
				'<p><img src="https://wordpress.com/2015/11/forest.jpg?w=1024" class="alignnone size-large wp-image-5823" alt="forest" width="1024" height="683" data-mce-src="https://wordpress.com/2015/11/forest.jpg?w=680" data-mce-selected="1"></p>'
			);
		} );

		test( 'should handle multiple images from content', () => {
			const value = resetImages(
				'<p><img src="https://example.com/bird.jpg?w=680" data-wpmedia-src="https://example.com/bird.jpg"><img src="https://example.com/forest.jpg?w=680" data-wpmedia-src="https://example.com/forest.jpg"></p>'
			);
			expect( value ).to.equal(
				'<p><img src="https://example.com/bird.jpg"><img src="https://example.com/forest.jpg"></p>'
			);
		} );

		test( 'should ignore non-replaced images in handling multiple images', () => {
			const value = resetImages(
				'<p><img src="https://example.com/bird.jpg?w=300"><img src="https://example.com/forest.jpg?w=680" data-wpmedia-src="https://example.com/forest.jpg"></p>'
			);
			expect( value ).to.equal(
				'<p><img src="https://example.com/bird.jpg?w=300"><img src="https://example.com/forest.jpg"></p>'
			);
		} );
	} );

	describe( '#setImages()', () => {
		test( 'should replace all instances of large images', () => {
			const value = setImages(
				'<p><img src="https://wordpress.com/2015/11/forest.jpg?w=1024" class="alignnone size-large wp-image-5823" alt="forest" width="1024" height="683" data-mce-src="https://wordpress.com/2015/11/forest.jpg?w=680" data-mce-selected="1"></p>'
			);
			expect( value ).to.equal(
				'<p><img src="https://wordpress.com/2015/11/forest.jpg?w=680" data-wpmedia-src="https://wordpress.com/2015/11/forest.jpg?w=1024" class="alignnone size-large wp-image-5823" alt="forest" width="1024" height="683" data-mce-src="https://wordpress.com/2015/11/forest.jpg?w=680" data-mce-selected="1"></p>'
			);
		} );

		test( 'should not replace already-replaced instances', () => {
			const value = setImages(
				'<p><img class="alignnone size-large wp-image-5823" src="https://wordpress.com/2015/11/forest.jpg?w=680" data-wpmedia-src="https://wordpress.com/2015/11/forest.jpg?w=1024" alt="forest" width="1024" height="683" data-mce-src="https://wordpress.com/2015/11/forest.jpg?w=680" data-mce-selected="1"></p>'
			);
			expect( value ).to.equal(
				'<p><img class="alignnone size-large wp-image-5823" src="https://wordpress.com/2015/11/forest.jpg?w=680" data-wpmedia-src="https://wordpress.com/2015/11/forest.jpg?w=1024" alt="forest" width="1024" height="683" data-mce-src="https://wordpress.com/2015/11/forest.jpg?w=680" data-mce-selected="1"></p>'
			);
		} );

		test( 'should replace images with indeterminate widths', () => {
			const value = setImages(
				'<p><img src="https://wordpress.com/2015/11/forest.jpg" alt="forest" class="alignnone size-thumbnail wp-image-5823" data-mce-selected="1"></p>'
			);
			expect( value ).to.equal(
				'<p><img src="https://wordpress.com/2015/11/forest.jpg?w=680" data-wpmedia-src="https://wordpress.com/2015/11/forest.jpg" alt="forest" class="alignnone size-thumbnail wp-image-5823" data-mce-selected="1"></p>'
			);
		} );

		test( 'should not replace external images (those without media ID)', () => {
			const markup =
				'<p><img src="https://wordpress.com/2015/11/forest.jpg" alt="forest" class="alignnone size-thumbnail"></p>';

			const value = setImages( markup );
			expect( value ).to.equal( markup );
		} );
	} );
} );
