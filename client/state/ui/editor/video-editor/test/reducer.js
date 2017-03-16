/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	VIDEO_EDITOR_POSTER_UPDATE_FAILURE,
	VIDEO_EDITOR_POSTER_UPDATE_SUCCESS,
	VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
	VIDEO_EDITOR_STATE_RESET,
	VIDEO_EDITOR_STATE_RESET_POSTER,
} from 'state/action-types';

import reducer, {
	hasPosterUpdateError,
	poster,
	posterIsUpdated,
	uploadProgress,
} from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'hasPosterUpdateError',
			'poster',
			'posterIsUpdated',
			'uploadProgress',
		] );
	} );

	describe( '#posterIsUpdated()', () => {
		it( 'should default to false', () => {
			const state = posterIsUpdated( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should change to true on successful update', () => {
			const state = posterIsUpdated( undefined, {
				type: VIDEO_EDITOR_POSTER_UPDATE_SUCCESS,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to true on failed update', () => {
			const state = posterIsUpdated( undefined, {
				type: VIDEO_EDITOR_POSTER_UPDATE_FAILURE,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to false on reset', () => {
			const state = posterIsUpdated( undefined, {
				type: VIDEO_EDITOR_STATE_RESET,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should change to false on poster reset', () => {
			const state = posterIsUpdated( undefined, {
				type: VIDEO_EDITOR_STATE_RESET_POSTER,
			} );

			expect( state ).to.be.false;
		} );
	} );

	describe( '#poster()', () => {
		const posterUrl = 'https://i1.wp.com/videos.files.wordpress.com/dummy-guid/thumbnail.jpg?ssl=1';

		it( 'should default to empty string', () => {
			const state = poster( undefined, {} );

			expect( state ).to.eql( '' );
		} );

		it( 'should change to poster url on successful update', () => {
			const state = poster( undefined, {
				type: VIDEO_EDITOR_POSTER_UPDATE_SUCCESS,
				poster: posterUrl,
			} );

			expect( state ).to.eql( posterUrl );
		} );

		it( 'should change to empty string on reset', () => {
			const state = poster( undefined, {
				type: VIDEO_EDITOR_STATE_RESET,
			} );

			expect( state ).to.eql( '' );
		} );

		it( 'should change to empty string on poster reset', () => {
			const state = poster( undefined, {
				type: VIDEO_EDITOR_STATE_RESET_POSTER,
			} );

			expect( state ).to.eql( '' );
		} );
	} );

	describe( '#uploadProgress()', () => {
		const percentage = 50;

		it( 'should default to 0', () => {
			const state = uploadProgress( undefined, {} );

			expect( state ).to.eql( 0 );
		} );

		it( 'should change to upload percentage on successful update', () => {
			const state = uploadProgress( undefined, {
				type: VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
				percentage,
			} );

			expect( state ).to.eql( percentage );
		} );

		it( 'should change to 0 on reset', () => {
			const state = uploadProgress( undefined, {
				type: VIDEO_EDITOR_STATE_RESET,
			} );

			expect( state ).to.eql( 0 );
		} );

		it( 'should change to 0 on poster reset', () => {
			const state = uploadProgress( undefined, {
				type: VIDEO_EDITOR_STATE_RESET_POSTER,
			} );

			expect( state ).to.eql( 0 );
		} );
	} );

	describe( '#hasPosterUpdateError()', () => {
		it( 'should default to false', () => {
			const state = hasPosterUpdateError( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should change to true on failed update', () => {
			const state = hasPosterUpdateError( undefined, {
				type: VIDEO_EDITOR_POSTER_UPDATE_FAILURE,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to false on successful update', () => {
			const state = hasPosterUpdateError( undefined, {
				type: VIDEO_EDITOR_POSTER_UPDATE_SUCCESS,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should change to false on reset', () => {
			const state = hasPosterUpdateError( undefined, {
				type: VIDEO_EDITOR_STATE_RESET,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should change to false on poster reset', () => {
			const state = hasPosterUpdateError( undefined, {
				type: VIDEO_EDITOR_STATE_RESET_POSTER,
			} );

			expect( state ).to.be.false;
		} );
	} );
} );
