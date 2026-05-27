import { getCalypsoQueryClient } from 'calypso/state/query-client';
import {
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
	READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
} from 'calypso/state/reader/action-types';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import { updateCachedPost, updateCachedPostsMatching } from '../cache';
import type { Post } from '../cache';
import type { QueryClient } from '@tanstack/react-query';
import type { Middleware } from 'redux';

type PostCacheAction = {
	type: string;
	globalIds?: string[];
	feedIds?: Array< number | string >;
	feedUrls?: string[];
	posts?: Array< Post | null | undefined >;
	payload?: {
		siteId?: number;
		postId?: number;
		followStatus?: string;
	};
};

type GetQueryClient = () => QueryClient | null;

const patchSeenState = ( queryClient: QueryClient, action: PostCacheAction ) => {
	const globalIds = new Set( action.globalIds );
	const feedIds = new Set( ( action.feedIds ?? [] ).map( String ) );
	const feedUrls = new Set( action.feedUrls ?? [] );

	const isSeen =
		action.type === READER_SEEN_MARK_AS_SEEN_RECEIVE ||
		action.type === READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE;

	updateCachedPostsMatching(
		queryClient,
		( post ) => {
			if ( typeof post.global_ID === 'string' && globalIds.has( post.global_ID ) ) {
				return true;
			}

			return (
				action.type === READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE &&
				( ( post.feed_ID != null && feedIds.has( String( post.feed_ID ) ) ) ||
					( typeof post.feed_URL === 'string' && feedUrls.has( post.feed_URL ) ) )
			);
		},
		() => ( { is_seen: isSeen } )
	);
};

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

		switch ( readerAction.type ) {
			case READER_SEEN_MARK_AS_SEEN_RECEIVE:
			case READER_SEEN_MARK_AS_UNSEEN_RECEIVE:
			case READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE:
				patchSeenState( queryClient, readerAction );
				break;
			case READER_CONVERSATION_UPDATE_FOLLOW_STATUS:
				patchConversationState( queryClient, readerAction );
				break;
		}

		return result;
	};

export default createPostCacheMiddleware();
