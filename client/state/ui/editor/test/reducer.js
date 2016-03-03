/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { EDITOR_POST_ID_SET } from 'state/action-types';
import reducer, { postId } from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'postId',
			'media',
			'contactForm'
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
} );
