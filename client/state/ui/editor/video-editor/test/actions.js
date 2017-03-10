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
	VIDEO_EDITOR_POSTER_UPDATING,
	VIDEO_EDITOR_SCRIPT_LOAD_ERROR,
	VIDEO_EDITOR_STATE_RESET,
	VIDEO_EDITOR_STATE_RESET_POSTER,
	VIDEO_EDITOR_VIDEO_HAS_LOADED,
} from 'state/action-types';
import {
	resetVideoEditorState,
	resetVideoEditorPosterState,
	setVideoEditorHasScriptLoadError,
	setVideoEditorVideoHasLoaded,
	updateVideoEditorPoster,
	updateVideoEditorPosterSuccess,
	updateVideoEditorPosterFailure,
	updatingVideoEditorPoster,
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

	describe( '#setVideoEditorHasScriptLoadError()', () => {
		it( 'should return an action object', () => {
			const action = setVideoEditorHasScriptLoadError();

			expect( action ).to.eql( {
				type: VIDEO_EDITOR_SCRIPT_LOAD_ERROR,
			} );
		} );
	} );

	describe( '#setVideoEditorVideoHasLoaded()', () => {
		it( 'should return an action object', () => {
			const action = setVideoEditorVideoHasLoaded();

			expect( action ).to.eql( {
				type: VIDEO_EDITOR_VIDEO_HAS_LOADED,
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

	describe( '#updatingVideoEditorPoster()', () => {
		it( 'should return an action object', () => {
			const action = updatingVideoEditorPoster();

			expect( action ).to.eql( {
				type: VIDEO_EDITOR_POSTER_UPDATING,
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
} );
