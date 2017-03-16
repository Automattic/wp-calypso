/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	VIDEO_EDITOR_POSTER_UPDATE,
	VIDEO_EDITOR_POSTER_UPDATE_FAILURE,
	VIDEO_EDITOR_POSTER_UPDATE_SUCCESS,
	VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
	VIDEO_EDITOR_STATE_RESET,
	VIDEO_EDITOR_STATE_RESET_POSTER,
} from 'state/action-types';
import {
	resetVideoEditorState,
	resetVideoEditorPosterState,
	showUploadProgress,
	updateVideoEditorPoster,
	updateVideoEditorPosterSuccess,
	updateVideoEditorPosterFailure,
} from '../actions';

describe( 'actions', () => {
	describe( '#resetVideoEditorState()', () => {
		it( 'should return an action object', () => {
			const action = resetVideoEditorState();

			expect( action ).to.eql( {
				type: VIDEO_EDITOR_STATE_RESET,
			} );
		} );
	} );

	describe( '#resetVideoEditorPosterState()', () => {
		it( 'should return an action object', () => {
			const action = resetVideoEditorPosterState();

			expect( action ).to.eql( {
				type: VIDEO_EDITOR_STATE_RESET_POSTER,
			} );
		} );
	} );

	describe( '#updateVideoEditorPoster()', () => {
		it( 'should return an action object', () => {
			const videoId = 'dummy-videoId';
			const params = { at_time: 1 };
			const action = updateVideoEditorPoster( videoId, params );

			expect( action ).to.eql( {
				type: VIDEO_EDITOR_POSTER_UPDATE,
				videoId,
				params
			} );
		} );
	} );

	describe( '#updateVideoEditorPosterSuccess()', () => {
		it( 'should return an action object', () => {
			const poster = 'https://i1.wp.com/videos.files.wordpress.com/dummy-guid/thumbnail.jpg?ssl=1';
			const action = updateVideoEditorPosterSuccess( poster );

			expect( action ).to.eql( {
				type: VIDEO_EDITOR_POSTER_UPDATE_SUCCESS,
				poster,
			} );
		} );
	} );

	describe( '#updateVideoEditorPosterFailure()', () => {
		it( 'should return an action object', () => {
			const action = updateVideoEditorPosterFailure();

			expect( action ).to.eql( {
				type: VIDEO_EDITOR_POSTER_UPDATE_FAILURE,
			} );
		} );
	} );

	describe( '#showUploadProgress()', () => {
		it( 'should return an action object', () => {
			const percentage = 50;
			const action = showUploadProgress( percentage );

			expect( action ).to.eql( {
				type: VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
				percentage,
			} );
		} );
	} );
} );
