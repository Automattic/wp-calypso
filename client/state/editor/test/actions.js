/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { EDITOR_POST_EDIT } from 'state/action-types';
import { editPost } from '../actions';

describe( 'actions', () => {
	describe( '#editPost()', () => {
		it( 'should return an action object for a new post', () => {
			const action = editPost( {
				title: 'Hello World'
			}, 2916284 );

			expect( action ).to.eql( {
				type: EDITOR_POST_EDIT,
				siteId: 2916284,
				postId: undefined,
				post: { title: 'Hello World' }
			} );
		} );

		it( 'should return an action object for an existing post', () => {
			const action = editPost( {
				title: 'Hello World'
			}, 2916284, 413 );

			expect( action ).to.eql( {
				type: EDITOR_POST_EDIT,
				siteId: 2916284,
				postId: 413,
				post: { title: 'Hello World' }
			} );
		} );
	} );
} );
