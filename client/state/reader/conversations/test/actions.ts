import {
	READER_CONVERSATION_FOLLOW,
	READER_CONVERSATION_MUTE,
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
} from 'calypso/state/reader/action-types';
import {
	followConversation,
	muteConversation,
	updateConversationFollowStatus,
} from 'calypso/state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';

type Dispatch = jest.Mock< any, any >;
type GetState = () => Record< string, unknown >;

const mockQueryClient = {};
const mockRemoveStreamItemFromCache = jest.fn();

jest.mock( 'calypso/state/query-client', () => ( {
	getCalypsoQueryClient: () => mockQueryClient,
} ) );

jest.mock( 'calypso/reader/data/stream', () => ( {
	removeStreamItemFromCache: ( ...args: unknown[] ) => mockRemoveStreamItemFromCache( ...args ),
} ) );

describe( 'actions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

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
			expect( mockRemoveStreamItemFromCache ).toHaveBeenCalledWith( mockQueryClient, {
				item: { blogId: 123, postId: 456 },
				streamKey: 'conversations-a8c',
			} );
			expect( mockRemoveStreamItemFromCache ).toHaveBeenCalledWith( mockQueryClient, {
				item: { blogId: 123, postId: 456 },
				streamKey: 'conversations',
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
