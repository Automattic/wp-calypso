/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { clearSelectedComments, selectAllComments, toggleSelectedComment } from '../actions';
import {
	COMMENTS_CLEAR_SELECTED,
	COMMENTS_SELECT_ALL,
	COMMENTS_TOGGLE_SELECTED,
} from 'state/action-types';

describe( 'actions', () => {
	describe( 'clearSelectedComments()', () => {
		test( 'return an appropriate action', () => {
			expect( clearSelectedComments( 123456 ) ).to.eql( {
				type: COMMENTS_CLEAR_SELECTED,
				siteId: 123456,
			} );
		} );
	} );

	describe( 'selectAllComments()', () => {
		test( 'return an appropriate action', () => {
			expect( selectAllComments( 123456, [] ) ).to.eql( {
				type: COMMENTS_SELECT_ALL,
				siteId: 123456,
				comments: [],
			} );
		} );
	} );

	describe( 'toggleSelectedComment()', () => {
		test( 'return an appropriate action', () => {
			expect( toggleSelectedComment( 123456, 1, 3 ) ).to.eql( {
				type: COMMENTS_TOGGLE_SELECTED,
				siteId: 123456,
				postId: 1,
				commentId: 3,
			} );
		} );
	} );
} );
