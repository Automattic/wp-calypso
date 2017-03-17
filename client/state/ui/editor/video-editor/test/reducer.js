/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	VIDEO_EDITOR_RESET_STATE,
	VIDEO_EDITOR_SET_POSTER_URL,
	VIDEO_EDITOR_SHOW_ERROR,
	VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
} from 'state/action-types';

import reducer, {
	hasPosterUpdateError,
	isPosterUpdated,
	posterUrl,
	uploadProgress,
} from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'hasPosterUpdateError',
			'isPosterUpdated',
			'posterUrl',
			'uploadProgress',
		] );
	} );

	describe( '#isPosterUpdated()', () => {
		it( 'should default to false', () => {
			const state = isPosterUpdated( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should change to true on successful update', () => {
			const state = isPosterUpdated( undefined, {
				type: VIDEO_EDITOR_SET_POSTER_URL,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to true on failed update', () => {
			const state = isPosterUpdated( undefined, {
				type: VIDEO_EDITOR_SHOW_ERROR,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to false on reset', () => {
			const state = isPosterUpdated( undefined, {
				type: VIDEO_EDITOR_RESET_STATE,
			} );

			expect( state ).to.be.false;
		} );
	} );

	describe( '#posterUrl()', () => {
		const url = 'https://i1.wp.com/videos.files.wordpress.com/dummy-guid/thumbnail.jpg?ssl=1';

		it( 'should default to empty string', () => {
			const state = posterUrl( undefined, {} );

			expect( state ).to.eql( '' );
		} );

		it( 'should change to poster url on successful update', () => {
			const state = posterUrl( undefined, {
				type: VIDEO_EDITOR_SET_POSTER_URL,
				posterUrl: url,
			} );

			expect( state ).to.eql( url );
		} );

		it( 'should change to empty string on reset', () => {
			const state = posterUrl( undefined, {
				type: VIDEO_EDITOR_RESET_STATE,
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
				type: VIDEO_EDITOR_RESET_STATE,
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
				type: VIDEO_EDITOR_SHOW_ERROR,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to false on successful update', () => {
			const state = hasPosterUpdateError( undefined, {
				type: VIDEO_EDITOR_SET_POSTER_URL,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should change to false on reset', () => {
			const state = hasPosterUpdateError( undefined, {
				type: VIDEO_EDITOR_RESET_STATE,
			} );

			expect( state ).to.be.false;
		} );
	} );
} );
