import {
	READER_CONVERSATION_FOLLOW,
	READER_CONVERSATION_MUTE,
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
	READER_STREAMS_REMOVE_ITEM,
} from 'calypso/state/reader/action-types';
import {
	followConversation,
	muteConversation,
	updateConversationFollowStatus,
} from 'calypso/state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';

type Dispatch = jest.Mock< any, any >;
type GetState = () => Record< string, unknown >;

describe( 'actions', () => {
	describe( '#followConversation', () => {
		test( 'should return an action when a conversation is followed', () => {
			const dispatch: Dispatch = jest.fn();
			const getState: GetState = () => ( {} );
			followConversation( { siteId: 123, postId: 456 } )( dispatch, getState );
			expect( dispatch ).toHaveBeenCalledWith( {
				type: READER_CONVERSATION_FOLLOW,
				payload: { siteId: 123, postId: 456 },
				meta: {
					previousState: null,
				},
			} );
		} );
	} );

	describe( '#muteConversation', () => {
		test( 'should return an action when a conversation is muted', () => {
			const dispatch: Dispatch = jest.fn();
			const getState: GetState = () => ( {} );
			muteConversation( { siteId: 123, postId: 456 } )( dispatch, getState );
			expect( dispatch ).toHaveBeenCalledWith( {
				type: READER_CONVERSATION_MUTE,
				payload: { siteId: 123, postId: 456 },
				meta: {
					previousState: null,
				},
			} );
			expect( dispatch ).toHaveBeenCalledWith( {
				type: READER_STREAMS_REMOVE_ITEM,
				payload: {
					postKey: { blogId: 123, postId: 456 },
					streamKey: 'conversations',
				},
			} );
			expect( dispatch ).toHaveBeenCalledWith( {
				type: READER_STREAMS_REMOVE_ITEM,
				payload: {
					postKey: { blogId: 123, postId: 456 },
					streamKey: 'conversations-a8c',
				},
			} );
		} );
	} );

	describe( '#updateConversationFollowStatus', () => {
		test( 'should return an action when a conversation follow status is updated', () => {
			const action = updateConversationFollowStatus( {
				siteId: 123,
				postId: 456,
				followStatus: CONVERSATION_FOLLOW_STATUS.muting,
			} );
			expect( action ).toEqual( {
				type: READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
				payload: { siteId: 123, postId: 456, followStatus: CONVERSATION_FOLLOW_STATUS.muting },
			} );
		} );
	} );
} );
