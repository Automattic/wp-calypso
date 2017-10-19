/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { READER_CONVERSATION_FOLLOW, READER_CONVERSATION_UNFOLLOW } from 'state/action-types';
import { followConversation, unfollowConversation } from 'state/reader/conversations/actions';

describe( 'actions', () => {
	describe( '#followConversation', () => {
		test( 'should return an action when a conversation is followed', () => {
			const action = followConversation( 123, 456 );
			expect( action ).to.deep.equal( {
				type: READER_CONVERSATION_FOLLOW,
				payload: { blogId: 123, postId: 456 },
			} );
		} );
	} );

	describe( '#unfollowConversation', () => {
		test( 'should return an action when a conversation is unfollowed', () => {
			const action = unfollowConversation( 123, 456 );
			expect( action ).to.deep.equal( {
				type: READER_CONVERSATION_UNFOLLOW,
				payload: { blogId: 123, postId: 456 },
			} );
		} );
	} );
} );
