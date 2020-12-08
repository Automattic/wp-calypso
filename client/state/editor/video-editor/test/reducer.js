/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { showError, uploadProgress, url } from '../reducer';
import {
	VIDEO_EDITOR_SET_POSTER_URL,
	VIDEO_EDITOR_SHOW_ERROR,
	VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'showError', 'uploadProgress', 'url' ] );
	} );

	describe( '#url()', () => {
		const posterUrl = 'https://i1.wp.com/videos.files.wordpress.com/guid/thumbnail.jpg?ssl=1';

		test( 'should default to null', () => {
			const state = url( undefined, {} );

			expect( state ).to.be.null;
		} );

		test( 'should change to poster url on successful update', () => {
			const state = url( undefined, {
				type: VIDEO_EDITOR_SET_POSTER_URL,
				posterUrl,
			} );

			expect( state ).to.eql( posterUrl );
		} );

		test( 'should change to null on some other state change', () => {
			const state = url( undefined, {
				type: VIDEO_EDITOR_SHOW_ERROR,
			} );

			expect( state ).to.be.null;
		} );
	} );

	describe( '#uploadProgress()', () => {
		const percentage = 50;

		test( 'should default to null', () => {
			const state = uploadProgress( undefined, {} );

			expect( state ).to.be.null;
		} );

		test( 'should change to upload percentage on successful update', () => {
			const state = uploadProgress( undefined, {
				type: VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
				percentage,
			} );

			expect( state ).to.eql( percentage );
		} );

		test( 'should change to null on some other state change', () => {
			const state = uploadProgress( undefined, {
				type: VIDEO_EDITOR_SHOW_ERROR,
			} );

			expect( state ).to.be.null;
		} );
	} );

	describe( '#showError()', () => {
		test( 'should default to false', () => {
			const state = showError( undefined, {} );

			expect( state ).to.be.false;
		} );

		test( 'should change to true on failed update', () => {
			const state = showError( undefined, {
				type: VIDEO_EDITOR_SHOW_ERROR,
			} );

			expect( state ).to.be.true;
		} );

		test( 'should change to false on some other state change', () => {
			const state = showError( undefined, {
				type: VIDEO_EDITOR_SET_POSTER_URL,
			} );

			expect( state ).to.be.false;
		} );
	} );
} );
