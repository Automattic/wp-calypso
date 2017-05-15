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
} from 'state/action-types';

import reducer, {
	closeModal,
	showError,
	uploadProgress,
	url,
} from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'closeModal',
			'showError',
			'uploadProgress',
			'url',
		] );
	} );

	describe( '#closeModal()', () => {
		it( 'should default to false', () => {
			const state = closeModal( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should change to true on successful update', () => {
			const state = closeModal( undefined, {
				type: VIDEO_EDITOR_CLOSE_MODAL,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to false on some other state change', () => {
			const state = closeModal( undefined, {
				type: VIDEO_EDITOR_SHOW_ERROR,
			} );

			expect( state ).to.be.false;
		} );
	} );

	describe( '#url()', () => {
		const posterUrl = 'https://i1.wp.com/videos.files.wordpress.com/guid/thumbnail.jpg?ssl=1';

		it( 'should default to null', () => {
			const state = url( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should change to poster url on successful update', () => {
			const state = url( undefined, {
				type: VIDEO_EDITOR_SET_POSTER_URL,
				posterUrl,
			} );

			expect( state ).to.eql( posterUrl );
		} );

		it( 'should change to null on some other state change', () => {
			const state = url( undefined, {
				type: VIDEO_EDITOR_SHOW_ERROR,
			} );

			expect( state ).to.be.null;
		} );
	} );

	describe( '#uploadProgress()', () => {
		const percentage = 50;

		it( 'should default to null', () => {
			const state = uploadProgress( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should change to upload percentage on successful update', () => {
			const state = uploadProgress( undefined, {
				type: VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
				percentage,
			} );

			expect( state ).to.eql( percentage );
		} );

		it( 'should change to null on modal closed', () => {
			const state = uploadProgress( undefined, {
				type: VIDEO_EDITOR_CLOSE_MODAL,
			} );

			expect( state ).to.be.null;
		} );

		it( 'should change to null on some other state change', () => {
			const state = uploadProgress( undefined, {
				type: VIDEO_EDITOR_SHOW_ERROR,
			} );

			expect( state ).to.be.null;
		} );
	} );

	describe( '#showError()', () => {
		it( 'should default to false', () => {
			const state = showError( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should change to true on failed update', () => {
			const state = showError( undefined, {
				type: VIDEO_EDITOR_SHOW_ERROR,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to false on some other state change', () => {
			const state = showError( undefined, {
				type: VIDEO_EDITOR_SET_POSTER_URL,
			} );

			expect( state ).to.be.false;
		} );
	} );
} );
