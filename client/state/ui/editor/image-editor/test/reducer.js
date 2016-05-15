/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	IMAGE_EDITOR_CROP,
	IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
	IMAGE_EDITOR_FLIP,
	IMAGE_EDITOR_SET_ASPECT_RATIO,
	IMAGE_EDITOR_SET_FILE_INFO,
	IMAGE_EDITOR_SET_CROP_BOUNDS,
	IMAGE_EDITOR_STATE_RESET
} from 'state/action-types';

import { AspectRatios } from '../constants';
import reducer, { hasChanges, fileInfo, transform, cropBounds, crop, aspectRatio } from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'hasChanges',
			'fileInfo',
			'transform',
			'cropBounds',
			'crop',
			'aspectRatio'
		] );
	} );

	describe( '#hasChanges()', () => {
		it( 'should default to false', () => {
			const state = hasChanges( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should change to true on rotate', () => {
			const state = hasChanges( undefined, {
				type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to true on flip', () => {
			const state = hasChanges( undefined, {
				type: IMAGE_EDITOR_FLIP
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to true on crop', () => {
			const state = hasChanges( undefined, {
				type: IMAGE_EDITOR_CROP
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to true on aspect ratio change', () => {
			const state = hasChanges( undefined, {
				type: IMAGE_EDITOR_SET_ASPECT_RATIO
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to false on reset', () => {
			const state = hasChanges( undefined, {
				type: IMAGE_EDITOR_STATE_RESET
			} );

			expect( state ).to.be.false;
		} );
	} );

	describe( '#aspectRatio()', () => {
		it( 'should default to free aspect', () => {
			const state = aspectRatio( undefined, {} );

			expect( state ).to.eql( AspectRatios.FREE );
		} );

		it( 'should update the aspect ratio', () => {
			const state = aspectRatio( undefined, {
				type: IMAGE_EDITOR_SET_ASPECT_RATIO,
				ratio: AspectRatios.ORIGINAL
			} );

			expect( state ).to.eql( AspectRatios.ORIGINAL );
		} );

		it( 'should reset to free', () => {
			const state = aspectRatio( undefined, {
				type: IMAGE_EDITOR_STATE_RESET
			} );

			expect( state ).to.eql( AspectRatios.FREE );
		} );
	} );

	describe( '#cropBounds()', () => {
		it( 'should return defaults initially', () => {
			const state = cropBounds( undefined, {} );

			expect( state ).to.eql( {
				topBound: 0,
				leftBound: 0,
				bottomBound: 100,
				rightBound: 100
			} );
		} );

		it( 'should update the bounds', () => {
			const state = cropBounds( undefined, {
				type: IMAGE_EDITOR_SET_CROP_BOUNDS,
				topBound: 100,
				leftBound: 200,
				bottomBound: 300,
				rightBound: 400
			} );

			expect( state ).to.eql( {
				topBound: 100,
				leftBound: 200,
				bottomBound: 300,
				rightBound: 400
			} );
		} );
	} );

	describe( '#crop()', () => {
		it( 'should return the whole image by default', () => {
			const state = crop( undefined, {} );

			expect( state ).to.eql( {
				topRatio: 0,
				leftRatio: 0,
				widthRatio: 1,
				heightRatio: 1
			} );
		} );

		it( 'should update the crop ratios', () => {
			const state = crop( undefined, {
				type: IMAGE_EDITOR_CROP,
				topRatio: 0.4,
				leftRatio: 0.5,
				widthRatio: 0.6,
				heightRatio: 0.7
			} );

			expect( state ).to.eql( {
				topRatio: 0.4,
				leftRatio: 0.5,
				widthRatio: 0.6,
				heightRatio: 0.7
			} );
		} );

		it( 'should update on rotate', () => {
			const state = crop( {
				topRatio: 0.4,
				leftRatio: 0.5,
				widthRatio: 0.4,
				heightRatio: 0.7
			}, {
				type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE
			} );

			expect( state ).to.have.all.keys( 'topRatio', 'leftRatio', 'widthRatio', 'heightRatio' );

			expect( state.topRatio ).to.be.within( 0.09, 0.11 );
			expect( state.leftRatio ).to.be.within( 0.39, 0.41 );
			expect( state.widthRatio ).to.be.within( 0.69, 0.71 );
			expect( state.heightRatio ).to.be.within( 0.39, 0.41 );
		} );

		it( 'should update on flip', () => {
			const state = crop( {
				topRatio: 0.4,
				leftRatio: 0.5,
				widthRatio: 0.4,
				heightRatio: 0.7
			}, {
				type: IMAGE_EDITOR_FLIP
			} );

			expect( state ).to.have.all.keys( 'topRatio', 'leftRatio', 'widthRatio', 'heightRatio' );

			expect( state.topRatio ).to.be.within( 0.39, 0.41 );
			expect( state.leftRatio ).to.be.within( 0.09, 0.11 );
			expect( state.widthRatio ).to.be.within( 0.39, 0.41 );
			expect( state.heightRatio ).to.be.within( 0.69, 0.71 );
		} );

		it( 'should reset', () => {
			const state = crop( undefined, {
				type: IMAGE_EDITOR_STATE_RESET
			} );

			expect( state ).to.eql( {
				topRatio: 0,
				leftRatio: 0,
				widthRatio: 1,
				heightRatio: 1
			} );
		} );
	} );

	describe( '#fileInfo()', () => {
		it( 'should default to empty source, default file name and type', () => {
			const state = fileInfo( undefined, {} );

			expect( state ).to.eql( {
				src: '',
				fileName: 'default',
				mimeType: 'image/png'
			} );
		} );

		it( 'should update the source, file name and mime type', () => {
			const state = fileInfo( undefined, {
				type: IMAGE_EDITOR_SET_FILE_INFO,
				src: 'testSrc',
				fileName: 'testFileName',
				mimeType: 'image/jpg'
			} );

			expect( state ).to.eql( {
				src: 'testSrc',
				fileName: 'testFileName',
				mimeType: 'image/jpg'
			} );
		} );
	} );

	describe( '#transform()', () => {
		it( 'should default to no rotation or scale', () => {
			const state = transform( undefined, {} );

			expect( state ).to.eql( {
				degrees: 0,
				scaleX: 1,
				scaleY: 1
			} );
		} );

		it( 'should return -90 degrees when rotated counterclockwise from 0 degrees', () => {
			const state = transform( {
				degrees: 0
			}, {
				type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE
			} );

			expect( state ).to.eql( {
				degrees: -90
			} );
		} );

		it( 'should return -180 degrees when rotated counterclockwise from -90 degrees', () => {
			const state = transform( {
				degrees: -90
			}, {
				type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE
			} );

			expect( state ).to.eql( {
				degrees: -180
			} );
		} );

		it( 'should reset the rotation if it is equal to or exceeds (+/-)360 degrees', () => {
			const state = transform( {
				degrees: -300
			}, {
				type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE
			} );

			expect( state ).to.eql( {
				degrees: -30
			} );
		} );

		it( 'should flip scaleX when it is not flipped', () => {
			const state = transform( {
				scaleX: 1
			}, {
				type: IMAGE_EDITOR_FLIP
			} );

			expect( state ).to.eql( {
				scaleX: -1
			} );
		} );

		it( 'should flip scaleX when it has been flipped', () => {
			const state = transform( {
				scaleX: -1
			}, {
				type: IMAGE_EDITOR_FLIP
			} );

			expect( state ).to.eql( {
				scaleX: 1
			} );
		} );

		it( 'should reset', () => {
			const state = transform( {
				degrees: 360,
				scaleX: -1,
				scaleY: 1
			}, {
				type: IMAGE_EDITOR_STATE_RESET
			} );

			expect( state ).to.eql( {
				degrees: 0,
				scaleX: 1,
				scaleY: 1
			} );
		} );
	} );
} );
