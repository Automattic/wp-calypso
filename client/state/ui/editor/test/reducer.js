/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { EDITOR_START, POST_SAVE_SUCCESS } from 'state/action-types';
import reducer, { postId } from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'postId',
			'lastDraft',
			'contactForm',
			'imageEditor',
			'videoEditor',
		] );
	} );

	describe( '#postId()', () => {
		it( 'should default to null', () => {
			const state = postId( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should update the tracked id when starting the editor', () => {
			const state = postId( undefined, {
				type: EDITOR_START,
				siteId: 1,
				postId: 184
			} );

			expect( state ).to.equal( 184 );
		} );

		it( 'should update the tracked post id if we save a draft post', () => {
			const state = postId( null, {
				type: POST_SAVE_SUCCESS,
				siteId: 1,
				postId: null,
				savedPost: {
					ID: 184
				},
				post: {}
			} );

			expect( state ).to.equal( 184 );
		} );

		it( 'should not update the tracked post id if we save a draft post but we already switched the tracked post ID', () => {
			const state = postId( 10, {
				type: POST_SAVE_SUCCESS,
				siteId: 1,
				postId: null,
				savedPost: {
					ID: 184
				},
				post: {}
			} );

			expect( state ).to.equal( 10 );
		} );
	} );
} );
