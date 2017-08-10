/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { EDITOR_LAST_DRAFT_SET } from 'state/action-types';
import { setEditorLastDraft, resetEditorLastDraft } from '../actions';

describe( 'actions', () => {
	describe( '#setEditorLastDraft()', () => {
		it( 'should return an action object', () => {
			const action = setEditorLastDraft( 2916284, 841 );

			expect( action ).to.eql( {
				type: EDITOR_LAST_DRAFT_SET,
				siteId: 2916284,
				postId: 841,
			} );
		} );
	} );

	describe( '#resetEditorLastDraft()', () => {
		it( 'should return an action object', () => {
			const action = resetEditorLastDraft();

			expect( action ).to.eql( {
				type: EDITOR_LAST_DRAFT_SET,
				siteId: null,
				postId: null,
			} );
		} );
	} );
} );
