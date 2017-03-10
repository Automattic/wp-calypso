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
	VIDEO_EDITOR_POSTER_UPDATING,
	VIDEO_EDITOR_SCRIPT_LOAD_ERROR,
	VIDEO_EDITOR_STATE_RESET,
	VIDEO_EDITOR_STATE_RESET_POSTER,
	VIDEO_EDITOR_VIDEO_HAS_LOADED,
} from 'state/action-types';

import reducer, {
	hasPosterUpdateError,
	hasScriptLoadError,
	poster,
	posterIsUpdating,
	posterIsUpdated,
	videoIsLoading,
} from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'hasPosterUpdateError',
			'hasScriptLoadError',
			'poster',
			'posterIsUpdating',
			'posterIsUpdated',
			'videoIsLoading',
		] );
	} );

	describe( '#videoIsLoading()', () => {
		it( 'should default to true', () => {
			const state = videoIsLoading( undefined, {} );

			expect( state ).to.be.true;
		} );

		it( 'should change to false on load', () => {
			const state = videoIsLoading( undefined, {
				type: VIDEO_EDITOR_VIDEO_HAS_LOADED,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should change to true on reset', () => {
			const state = videoIsLoading( undefined, {
				type: VIDEO_EDITOR_STATE_RESET,
			} );

			expect( state ).to.be.true;
		} );
	} );

	describe( '#posterIsUpdating()', () => {
		it( 'should default to false', () => {
			const state = posterIsUpdating( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should change to true on poster update', () => {
			const state = posterIsUpdating( undefined, {
				type: VIDEO_EDITOR_POSTER_UPDATING,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to false on successful update', () => {
			const state = posterIsUpdating( undefined, {
				type: VIDEO_EDITOR_POSTER_UPDATE_SUCCESS,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should change to false on failed update', () => {
			const state = posterIsUpdating( undefined, {
				type: VIDEO_EDITOR_POSTER_UPDATE_FAILURE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should change to false on reset', () => {
			const state = posterIsUpdating( undefined, {
				type: VIDEO_EDITOR_STATE_RESET,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should change to false on poster reset', () => {
			const state = posterIsUpdating( undefined, {
				type: VIDEO_EDITOR_STATE_RESET_POSTER,
			} );

			expect( state ).to.be.false;
		} );
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

		it( 'should change to false on poster update', () => {
			const state = hasPosterUpdateError( undefined, {
				type: VIDEO_EDITOR_POSTER_UPDATING,
			} );

			expect( state ).to.be.false;
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

	describe( '#hasScriptLoadError()', () => {
		it( 'should default to false', () => {
			const state = hasScriptLoadError( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should change to true on script load error', () => {
			const state = hasScriptLoadError( undefined, {
				type: VIDEO_EDITOR_SCRIPT_LOAD_ERROR,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to false on reset', () => {
			const state = hasScriptLoadError( undefined, {
				type: VIDEO_EDITOR_STATE_RESET,
			} );

			expect( state ).to.be.false;
		} );
	} );
} );
