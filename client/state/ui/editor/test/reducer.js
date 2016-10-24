/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { EDITOR_POST_ID_SET, EDITOR_SHOW_DRAFTS_TOGGLE } from 'state/action-types';
import reducer, { postId, showDrafts } from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'postId',
			'showDrafts',
			'lastDraft',
			'contactForm',
			'imageEditor'
		] );
	} );

	describe( '#postId()', () => {
		it( 'should default to null', () => {
			const state = postId( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should track editor post ID', () => {
			const state = postId( undefined, {
				type: EDITOR_POST_ID_SET,
				postId: 184
			} );

			expect( state ).to.equal( 184 );
		} );
	} );

	describe( '#showDrafts()', () => {
		it( 'should default to false', () => {
			const state = showDrafts( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should track toggled state', () => {
			const state = showDrafts( undefined, {
				type: EDITOR_SHOW_DRAFTS_TOGGLE
			} );

			expect( state ).to.be.true;
		} );
	} );
} );
