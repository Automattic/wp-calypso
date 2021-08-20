import { expect } from 'chai';
import { EDITOR_LAST_DRAFT_SET } from 'calypso/state/action-types';
import { setEditorLastDraft, resetEditorLastDraft } from '../actions';

describe( 'actions', () => {
	describe( '#setEditorLastDraft()', () => {
		test( 'should return an action object', () => {
			const action = setEditorLastDraft( 2916284, 841 );

			expect( action ).to.eql( {
				type: EDITOR_LAST_DRAFT_SET,
				siteId: 2916284,
				postId: 841,
			} );
		} );
	} );

	describe( '#resetEditorLastDraft()', () => {
		test( 'should return an action object', () => {
			const action = resetEditorLastDraft();

			expect( action ).to.eql( {
				type: EDITOR_LAST_DRAFT_SET,
				siteId: null,
				postId: null,
			} );
		} );
	} );
} );
