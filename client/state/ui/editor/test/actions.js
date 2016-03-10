/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { EDITOR_POST_ID_SET } from 'state/action-types';
import { setEditorPostId } from '../actions';

describe( 'actions', () => {
	describe( '#setEditorPostId()', () => {
		it( 'should return an action object', () => {
			const action = setEditorPostId( 183 );

			expect( action ).to.eql( {
				type: EDITOR_POST_ID_SET,
				postId: 183
			} );
		} );
	} );
} );
