/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	VIDEO_EDITOR_POSTER_UPDATE,
	VIDEO_EDITOR_POSTER_UPDATE_FAILURE,
	VIDEO_EDITOR_POSTER_UPDATE_SUCCESS,
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
		const spy = sinon.spy();
		const guid = 'dummy-guid';
		const params = { at_time: 1 };
		const apiBaseUrl = 'https://public-api.wordpress.com:443';
		const endpoint = `/rest/v1.1/videos/${ guid }/poster`;
		const poster = 'https://i1.wp.com/videos.files.wordpress.com/dummy-guid/thumbnail.jpg?ssl=1';

		beforeEach( () => {
			spy.reset();
		} );

		it( 'should dispatch update action when thunk triggered', () => {
			nock( apiBaseUrl )
				.post( endpoint )
				.reply( 200, { poster } );

			updateVideoEditorPoster( guid, params )( spy );

			expect( spy ).to.have.been.calledWith( { type: VIDEO_EDITOR_POSTER_UPDATE } );
		} );

		it( 'should dispatch success action when request completes', () => {
			nock( apiBaseUrl )
				.post( endpoint )
				.reply( 200, { poster } );

			return updateVideoEditorPoster( guid, params )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: VIDEO_EDITOR_POSTER_UPDATE_SUCCESS,
					poster,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			const errorResponse = {
				status: 400,
				message: 'Something wrong!',
			};

			nock( apiBaseUrl )
				.post( endpoint )
				.reply( errorResponse.status, errorResponse );

			return updateVideoEditorPoster( guid, params )( spy )
				.then( () =>
					expect( spy.calledWithMatch( {
						type: VIDEO_EDITOR_POSTER_UPDATE_FAILURE,
						error: errorResponse,
					} ) ).to.be.true
				);
		} );
	} );
} );
