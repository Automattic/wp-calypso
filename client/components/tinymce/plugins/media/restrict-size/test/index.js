/**
 * External dependencies
 */
import { expect } from 'chai';
import rewire from 'rewire';

/**
 * Internal dependencies
 */
import setupTestEnv from 'lib/react-test-env-setup';

describe( 'restrictSize', () => {
	let restrictSize;
	before( () => {
		setupTestEnv();
		restrictSize = rewire( '../' );
	} );

	describe( '#getMaxWidth()', () => {
		let getMaxWidth, matchMedia;
		before( () => {
			getMaxWidth = restrictSize.__get__( 'getMaxWidth' );
			matchMedia = window.matchMedia;
		} );

		afterEach( () => {
			delete window.devicePixelRatio;
			window.matchMedia = matchMedia;
		} );

		it( 'should return the multiple of the root device ratio if available', () => {
			window.devicePixelRatio = 1.5;

			expect( getMaxWidth() ).to.equal( 839 );
		} );

		it( 'should return twice the base if the device resolution matches the retina media query', () => {
			window.matchMedia = () => ( { matches: true } );

			expect( getMaxWidth() ).to.equal( 1118 );
		} );

		it( 'should return the base max width if the device is not retina-capable', () => {
			expect( getMaxWidth() ).to.equal( 559 );
		} );
	} );

	describe( '#resetImages()', () => {
		let resetImages;
		before( () => {
			resetImages = restrictSize.__get__( 'resetImages' );
		} );

		it( 'should restore all instances of replaced images', () => {
			const value = resetImages( '<p><img src="https://wordpress.com/2015/11/forest.jpg?w=559" data-wpmedia-src="https://wordpress.com/2015/11/forest.jpg?w=1024" class="alignnone size-large wp-image-5823" alt="forest" width="1024" height="683" data-mce-src="https://wordpress.com/2015/11/forest.jpg?w=559" data-mce-selected="1"></p>' );
			expect( value ).to.equal( '<p><img src="https://wordpress.com/2015/11/forest.jpg?w=1024" class="alignnone size-large wp-image-5823" alt="forest" width="1024" height="683" data-mce-src="https://wordpress.com/2015/11/forest.jpg?w=559" data-mce-selected="1"></p>' );
		} );

		it( 'should handle multiple images from content', () => {
			const value = resetImages( '<p><img src="https://example.com/bird.jpg?w=559" data-wpmedia-src="https://example.com/bird.jpg"><img src="https://example.com/forest.jpg?w=559" data-wpmedia-src="https://example.com/forest.jpg"></p>' );
			expect( value ).to.equal( '<p><img src="https://example.com/bird.jpg"><img src="https://example.com/forest.jpg"></p>' );
		} );

		it( 'should ignore non-replaced images in handling multiple images', () => {
			const value = resetImages( '<p><img src="https://example.com/bird.jpg?w=300"><img src="https://example.com/forest.jpg?w=559" data-wpmedia-src="https://example.com/forest.jpg"></p>' );
			expect( value ).to.equal( '<p><img src="https://example.com/bird.jpg?w=300"><img src="https://example.com/forest.jpg"></p>' );
		} );
	} );

	describe( '#setImages()', () => {
		let setImages;
		before( () => {
			setImages = restrictSize.__get__( 'setImages' );
		} );

		it( 'should replace all instances of large images', () => {
			const value = setImages( '<p><img src="https://wordpress.com/2015/11/forest.jpg?w=1024" class="alignnone size-large wp-image-5823" alt="forest" width="1024" height="683" data-mce-src="https://wordpress.com/2015/11/forest.jpg?w=559" data-mce-selected="1"></p>' );
			expect( value ).to.equal( '<p><img src="https://wordpress.com/2015/11/forest.jpg?w=559" data-wpmedia-src="https://wordpress.com/2015/11/forest.jpg?w=1024" class="alignnone size-large wp-image-5823" alt="forest" width="1024" height="683" data-mce-src="https://wordpress.com/2015/11/forest.jpg?w=559" data-mce-selected="1"></p>' );
		} );

		it( 'should not replace already-replaced instances', () => {
			const value = setImages( '<p><img class="alignnone size-large wp-image-5823" src="https://wordpress.com/2015/11/forest.jpg?w=559" data-wpmedia-src="https://wordpress.com/2015/11/forest.jpg?w=1024" alt="forest" width="1024" height="683" data-mce-src="https://wordpress.com/2015/11/forest.jpg?w=559" data-mce-selected="1"></p>' );
			expect( value ).to.equal( '<p><img class="alignnone size-large wp-image-5823" src="https://wordpress.com/2015/11/forest.jpg?w=559" data-wpmedia-src="https://wordpress.com/2015/11/forest.jpg?w=1024" alt="forest" width="1024" height="683" data-mce-src="https://wordpress.com/2015/11/forest.jpg?w=559" data-mce-selected="1"></p>' );
		} );

		it( 'should not replace small images', () => {
			const value = setImages( '<p><img src="https://wordpress.com/2015/11/forest.jpg?w=150" alt="forest" width="150" height="100" class="alignnone size-thumbnail wp-image-5823" data-mce-selected="1"></p>' );
			expect( value ).to.equal( '<p><img src="https://wordpress.com/2015/11/forest.jpg?w=150" alt="forest" width="150" height="100" class="alignnone size-thumbnail wp-image-5823" data-mce-selected="1"></p>' );
		} );

		it( 'should not replace images with indeterminate widths', () => {
			const value = setImages( '<p><img src="https://wordpress.com/2015/11/forest.jpg" alt="forest" class="alignnone size-thumbnail wp-image-5823" data-mce-selected="1"></p>' );
			expect( value ).to.equal( '<p><img src="https://wordpress.com/2015/11/forest.jpg" alt="forest" class="alignnone size-thumbnail wp-image-5823" data-mce-selected="1"></p>' );
		} );

		it( 'should handle multiple images of mixed replacement needs', () => {
			const value = setImages( '<p><img src="https://example.com/bird.jpg" width="200" height="174"><img src="https://example.com/forest.jpg?w=1024" width="1024" height="683"></p>' );
			expect( value ).to.equal( '<p><img src="https://example.com/bird.jpg" width="200" height="174"><img src="https://example.com/forest.jpg?w=559" data-wpmedia-src="https://example.com/forest.jpg?w=1024" width="1024" height="683"></p>' );
		} );
	} );
} );
