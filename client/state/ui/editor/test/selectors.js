/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getEditorPostId, isEditorNewPost, isEditorDraftsVisible } from '../selectors';

describe( 'selectors', () => {
	describe( '#getEditorPostId()', () => {
		it( 'should return the current editor post ID', () => {
			const postId = getEditorPostId( {
				ui: {
					editor: {
						postId: 183
					}
				}
			} );

			expect( postId ).to.equal( 183 );
		} );
	} );

	describe( '#isEditorNewPost()', () => {
		it( 'should return false if a post ID is currently set', () => {
			const isNew = isEditorNewPost( {
				ui: {
					editor: {
						postId: 183
					}
				}
			} );

			expect( isNew ).to.be.false;
		} );

		it( 'should return true if no post ID is currently set', () => {
			const isNew = isEditorNewPost( {
				ui: {
					editor: {
						postId: null
					}
				}
			} );

			expect( isNew ).to.be.true;
		} );
	} );

	describe( '#isEditorDraftsVisible()', () => {
		it( 'should return the current drafts visible state', () => {
			const showDrafts = isEditorDraftsVisible( {
				ui: {
					editor: {
						showDrafts: true
					}
				}
			} );

			expect( showDrafts ).to.be.true;
		} );
	} );
} );
