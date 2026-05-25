import { removeStreamItemFromCache } from 'calypso/reader/data/stream';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import {
	READER_CONVERSATION_FOLLOW,
	READER_CONVERSATION_MUTE,
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
} from 'calypso/state/reader/action-types';
import { getReaderConversationFollowStatus } from 'calypso/state/reader/conversations/selectors';

import 'calypso/state/data-layer/wpcom/read/sites/posts/follow';
import 'calypso/state/data-layer/wpcom/read/sites/posts/mute';

import 'calypso/state/reader/init';

export function followConversation( { siteId, postId } ) {
	return ( dispatch, getState ) => {
		dispatch( {
			type: READER_CONVERSATION_FOLLOW,
			payload: {
				siteId,
				postId,
			},
			meta: {
				previousState: getReaderConversationFollowStatus( getState(), {
					siteId,
					postId,
				} ),
			},
		} );
	};
}
export function muteConversation( { siteId, postId } ) {
	return ( dispatch, getState ) => {
		dispatch( {
			type: READER_CONVERSATION_MUTE,
			payload: {
				siteId,
				postId,
			},
			meta: {
				previousState: getReaderConversationFollowStatus( getState(), {
					siteId,
					postId,
				} ),
			},
		} );
		const queryClient = getCalypsoQueryClient();
		if ( queryClient ) {
			removeStreamItemFromCache( queryClient, {
				item: { blogId: siteId, postId },
				streamKey: 'conversations-a8c',
			} );
			removeStreamItemFromCache( queryClient, {
				item: { blogId: siteId, postId },
				streamKey: 'conversations',
			} );
		}
	};
}

export function updateConversationFollowStatus( { siteId, postId, followStatus } ) {
	return {
		type: READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
		payload: {
			siteId,
			postId,
			followStatus,
		},
	};
}
