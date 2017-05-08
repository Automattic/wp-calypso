/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	VIDEO_EDITOR_CLOSE_MODAL,
	VIDEO_EDITOR_SET_POSTER_URL,
	VIDEO_EDITOR_SHOW_ERROR,
	VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
	VIDEO_EDITOR_UPDATE_POSTER,
} from 'state/action-types';
import {
	closeModal,
	setPosterUrl,
	showError,
	showUploadProgress,
	updatePoster,
} from '../actions';

describe( 'actions', () => {
	describe( '#updatePoster()', () => {
		it( 'should return an action object', () => {
			const videoId = 'dummy-videoId';
			const params = { atTime: 1 };
			const action = updatePoster( videoId, params );

			expect( action ).to.eql( {
				type: VIDEO_EDITOR_UPDATE_POSTER,
				videoId,
				params
			} );
		} );
	} );

	describe( '#setPosterUrl()', () => {
		it( 'should return an action object', () => {
			const poster = 'https://i1.wp.com/videos.files.wordpress.com/dummy-guid/thumbnail.jpg?ssl=1';
			const action = setPosterUrl( poster );

			expect( action ).to.eql( {
				type: VIDEO_EDITOR_SET_POSTER_URL,
				posterUrl: poster,
			} );
		} );
	} );

	describe( '#closeModal()', () => {
		it( 'should return an action object', () => {
			const action = closeModal();

			expect( action ).to.eql( {
				type: VIDEO_EDITOR_CLOSE_MODAL,
			} );
		} );
	} );

	describe( '#showError()', () => {
		it( 'should return an action object', () => {
			const action = showError();

			expect( action ).to.eql( {
				type: VIDEO_EDITOR_SHOW_ERROR,
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
