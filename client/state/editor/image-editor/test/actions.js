/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	resetImageEditorState,
	resetAllImageEditorState,
	imageEditorRotateCounterclockwise,
	imageEditorFlip,
	setImageEditorAspectRatio,
	setImageEditorDefaultAspectRatio,
	setImageEditorFileInfo,
	setImageEditorCropBounds,
	imageEditorCrop,
	imageEditorComputedCrop,
	setImageEditorImageHasLoaded,
} from '../actions';
import { AspectRatios } from '../constants';
import {
	IMAGE_EDITOR_CROP,
	IMAGE_EDITOR_COMPUTED_CROP,
	IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
	IMAGE_EDITOR_FLIP,
	IMAGE_EDITOR_SET_ASPECT_RATIO,
	IMAGE_EDITOR_SET_DEFAULT_ASPECT_RATIO,
	IMAGE_EDITOR_SET_FILE_INFO,
	IMAGE_EDITOR_SET_CROP_BOUNDS,
	IMAGE_EDITOR_STATE_RESET,
	IMAGE_EDITOR_STATE_RESET_ALL,
	IMAGE_EDITOR_IMAGE_HAS_LOADED,
} from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( '#resetImageEditorState()', () => {
		test( 'should return an action object', () => {
			const action = resetImageEditorState();

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_STATE_RESET,
				additionalData: {},
			} );
		} );

		test( 'should return an action object with additional data if specified', () => {
			const action = resetImageEditorState( { aspectRatio: AspectRatios.FREE } );

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_STATE_RESET,
				additionalData: {
					aspectRatio: AspectRatios.FREE,
				},
			} );
		} );
	} );

	describe( '#resetAllImageEditorState()', () => {
		test( 'should return an action object', () => {
			const action = resetAllImageEditorState();

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_STATE_RESET_ALL,
				additionalData: {},
			} );
		} );

		test( 'should return an action object with additional data if specified', () => {
			const action = resetAllImageEditorState( { aspectRatio: AspectRatios.FREE } );

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_STATE_RESET_ALL,
				additionalData: {
					aspectRatio: AspectRatios.FREE,
				},
			} );
		} );
	} );

	describe( '#imageEditorRotateCounterclockwise()', () => {
		test( 'should return an action object', () => {
			const action = imageEditorRotateCounterclockwise();

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
			} );
		} );
	} );

	describe( '#imageEditorFlip()', () => {
		test( 'should return an action object', () => {
			const action = imageEditorFlip();

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_FLIP,
			} );
		} );
	} );

	describe( '#setImageEditorFileInfo()', () => {
		test( 'should return an action object', () => {
			const action = setImageEditorFileInfo( 'testSrc', 'testFileName', 'image/jpg', 'My Title' );

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_SET_FILE_INFO,
				src: 'testSrc',
				fileName: 'testFileName',
				mimeType: 'image/jpg',
				title: 'My Title',
			} );
		} );
	} );

	describe( '#setImageEditorCropBounds()', () => {
		test( 'should return an action object', () => {
			const action = setImageEditorCropBounds( 100, 200, 300, 400 );

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_SET_CROP_BOUNDS,
				topBound: 100,
				leftBound: 200,
				bottomBound: 300,
				rightBound: 400,
			} );
		} );
	} );

	describe( '#imageEditorComputedCrop()', () => {
		test( 'should return an action object', () => {
			const action = imageEditorComputedCrop( 0.2, 0.3, 0.4, 0.5 );

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_COMPUTED_CROP,
				topRatio: 0.2,
				leftRatio: 0.3,
				widthRatio: 0.4,
				heightRatio: 0.5,
			} );
		} );
	} );

	test( 'should return an action object', () => {
		const action = imageEditorCrop( 0.2, 0.3, 0.4, 0.5 );

		expect( action ).to.eql( {
			type: IMAGE_EDITOR_CROP,
			topRatio: 0.2,
			leftRatio: 0.3,
			widthRatio: 0.4,
			heightRatio: 0.5,
		} );
	} );

	describe( '#setImageEditorAspectRatio()', () => {
		test( 'should return an action object', () => {
			const action = setImageEditorAspectRatio( AspectRatios.ORIGINAL );

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_SET_ASPECT_RATIO,
				ratio: AspectRatios.ORIGINAL,
			} );
		} );
	} );

	describe( '#setImageEditorDefaultAspectRatio()', () => {
		test( 'should return an action object', () => {
			const action = setImageEditorDefaultAspectRatio( AspectRatios.ORIGINAL );

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_SET_DEFAULT_ASPECT_RATIO,
				ratio: AspectRatios.ORIGINAL,
			} );
		} );
	} );

	describe( '#setImageEditorImageHasLoaded()', () => {
		test( 'should return an action object', () => {
			const action = setImageEditorImageHasLoaded( 123, 456 );

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_IMAGE_HAS_LOADED,
				width: 123,
				height: 456,
			} );
		} );
	} );
} );
