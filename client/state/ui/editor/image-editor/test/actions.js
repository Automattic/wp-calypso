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

import {
	resetImageEditorState,
	imageEditorRotateCounterclockwise,
	imageEditorFlip,
	setImageEditorAspectRatio,
	setImageEditorFileInfo,
	setImageEditorCropBounds,
	imageEditorCrop
} from '../actions';
import { AspectRatios } from '../constants';

describe( 'actions', () => {
	describe( '#resetImageEditorState()', () => {
		it( 'should return an action object', () => {
			const action = resetImageEditorState();

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_STATE_RESET
			} );
		} );
	} );

	describe( '#imageEditorRotateCounterclockwise()', () => {
		it( 'should return an action object', () => {
			const action = imageEditorRotateCounterclockwise();

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE
			} );
		} );
	} );

	describe( '#imageEditorFlip()', () => {
		it( 'should return an action object', () => {
			const action = imageEditorFlip();

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_FLIP
			} );
		} );
	} );

	describe( '#setImageEditorFileInfo()', () => {
		it( 'should return an action object', () => {
			const action = setImageEditorFileInfo( 'testSrc', 'testFileName', 'image/jpg' );

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_SET_FILE_INFO,
				src: 'testSrc',
				fileName: 'testFileName',
				mimeType: 'image/jpg'
			} );
		} );
	} );

	describe( '#setImageEditorCropBounds()', () => {
		it( 'should return an action object', () => {
			const action = setImageEditorCropBounds( 100, 200, 300, 400 );

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_SET_CROP_BOUNDS,
				topBound: 100,
				leftBound: 200,
				bottomBound: 300,
				rightBound: 400
			} );
		} );
	} );

	describe( '#imageEditorCrop()', () => {
		it( 'should return an action object', () => {
			const action = imageEditorCrop( 0.2, 0.3, 0.4, 0.5 );

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_CROP,
				topRatio: 0.2,
				leftRatio: 0.3,
				widthRatio: 0.4,
				heightRatio: 0.5
			} );
		} );
	} );

	describe( '#setImageEditorAspectRatio()', () => {
		it( 'should return an action object', () => {
			const action = setImageEditorAspectRatio( AspectRatios.ORIGINAL );

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_SET_ASPECT_RATIO,
				ratio: AspectRatios.ORIGINAL
			} );
		} );
	} );
} );
