/** @format */

/**
 * Internal dependencies
 */
import {
	READER_CONVERSATION_FOLLOW,
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
} from 'state/action-types';
import {
	followConversation,
	updateConversationFollowStatus,
} from 'state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS_MUTING } from 'state/reader/conversations/follow-status';

describe( 'actions', () => {
	describe( '#followConversation', () => {
		test( 'should return an action when a conversation is followed', () => {
			const action = followConversation( { blogId: 123, postId: 456 } );
			expect( action ).toEqual( {
				type: READER_CONVERSATION_FOLLOW,
				payload: { blogId: 123, postId: 456 },
			} );
		} );
	} );

	describe( '#updateConversationFollowStatus', () => {
		test( 'should return an action when a conversation follow status is updated', () => {
			const action = updateConversationFollowStatus( {
				blogId: 123,
				postId: 456,
				followStatus: CONVERSATION_FOLLOW_STATUS_MUTING,
			} );
			expect( action ).toEqual( {
				type: READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
				payload: { blogId: 123, postId: 456, followStatus: CONVERSATION_FOLLOW_STATUS_MUTING },
			} );
		} );
	} );
} );
