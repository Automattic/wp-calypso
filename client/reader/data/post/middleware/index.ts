import { getCalypsoQueryClient } from 'calypso/state/query-client';
import { READER_CONVERSATION_UPDATE_FOLLOW_STATUS } from 'calypso/state/reader/action-types';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import { updateCachedPost } from '../cache';
import type { QueryClient } from '@tanstack/react-query';
import type { Middleware } from 'redux';

type PostCacheAction = {
	type: string;
	payload?: {
		siteId?: number;
		postId?: number;
		followStatus?: string;
	};
};

type GetQueryClient = () => QueryClient | null;

const patchConversationState = ( queryClient: QueryClient, action: PostCacheAction ) => {
	const { siteId, postId, followStatus } = action.payload ?? {};
	if ( ! siteId || ! postId ) {
		return;
	}

	updateCachedPost( queryClient, { blogId: siteId, postId }, () => ( {
		is_following_conversation: followStatus === CONVERSATION_FOLLOW_STATUS.following,
	} ) );
};

export const createPostCacheMiddleware =
	( getQueryClient: GetQueryClient = getCalypsoQueryClient ): Middleware =>
	() =>
	( next ) =>
	( action: unknown ) => {
		const result = next( action );
		const readerAction = action as PostCacheAction;
		const queryClient = getQueryClient();

		if ( ! queryClient ) {
			return result;
		}

		if ( readerAction.type === READER_CONVERSATION_UPDATE_FOLLOW_STATUS ) {
			patchConversationState( queryClient, readerAction );
		}

		return result;
	};

export default createPostCacheMiddleware();
