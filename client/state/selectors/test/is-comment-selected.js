/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isCommentSelected } from '../';

describe( 'isCommentSelected()', () => {
	const state = {
		ui: { comments: { selected: { 123456: { 1: { commentId: 1, postId: 2 } } } } },
	};

	test( 'should return false if state is empty', () => {
		expect( isCommentSelected( {}, 123456, 1 ) ).to.be.false;
	} );

	test( 'should return true for selected comments', () => {
		expect( isCommentSelected( state, 123456, 1 ) ).to.be.true;
	} );

	test( 'should return false for deselected comments', () => {
		expect( isCommentSelected( state, 123456, 2 ) ).to.be.false;
	} );
} );
