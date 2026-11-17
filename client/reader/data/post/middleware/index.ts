import { getReaderPostQueryKeyPrefix } from '@automattic/api-queries';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import {
	READER_CONVERSATION_FOLLOW,
	READER_CONVERSATION_MUTE,
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
} from 'calypso/state/reader/action-types';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import { updateCachedPost } from '../cache';
import type { ReadPost } from '@automattic/api-core';
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

const patchConversationState = (
	queryClient: QueryClient,
	action: PostCacheAction,
	isFollowing: boolean
) => {
	const { siteId, postId } = action.payload ?? {};
	if ( ! siteId || ! postId ) {
		return;
	}

	updateCachedPost( queryClient, { blogId: siteId, postId }, () => ( {
		is_following_conversation: isFollowing,
	} ) );
	// A remounted post view syncs the fetched post again, so it has to agree with the cache.
	queryClient.setQueriesData< ReadPost >(
		{
			queryKey: getReaderPostQueryKeyPrefix(),
			predicate: ( { state } ) => {
				const post = state.data as Partial< ReadPost > | undefined;
				// Rewriting a post that already agrees would sync it again, and dispatch again.
				return (
					post?.site_ID === siteId &&
					post?.ID === postId &&
					post?.is_following_conversation !== isFollowing
				);
			},
		},
		( post ) => post && { ...post, is_following_conversation: isFollowing }
	);
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

		switch ( readerAction.type ) {
			case READER_CONVERSATION_FOLLOW:
				patchConversationState( queryClient, readerAction, true );
				break;
			case READER_CONVERSATION_MUTE:
				patchConversationState( queryClient, readerAction, false );
				break;
			case READER_CONVERSATION_UPDATE_FOLLOW_STATUS:
				patchConversationState(
					queryClient,
					readerAction,
					readerAction.payload?.followStatus === CONVERSATION_FOLLOW_STATUS.following
				);
				break;
		}

		return result;
	};

export default createPostCacheMiddleware();
