/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
	IMAGE_EDITOR_FLIP,
	IMAGE_EDITOR_SET_ASPECT_RATIO,
	IMAGE_EDITOR_SET_FILE_INFO,
	IMAGE_EDITOR_STATE_RESET
} from 'state/action-types';

import {
	resetImageEditorState,
	imageEditorRotateCounterclockwise,
	imageEditorFlip,
	setImageEditorAspectRatio,
	setImageEditorFileInfo,
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
			const action = setImageEditorFileInfo( 'testSrc', 'testFileName', 'image/jpg', 'My Title' );

			expect( action ).to.eql( {
				type: IMAGE_EDITOR_SET_FILE_INFO,
				src: 'testSrc',
				fileName: 'testFileName',
				mimeType: 'image/jpg',
				title: 'My Title'
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
