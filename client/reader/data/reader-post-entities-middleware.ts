import {
	POST_LIKE,
	POST_LIKES_ADD_LIKER,
	POST_LIKES_RECEIVE,
	POST_LIKES_REMOVE_LIKER,
	POST_UNLIKE,
} from 'calypso/state/action-types';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import {
	READER_POSTS_RECEIVE,
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
	READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
} from 'calypso/state/reader/action-types';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import {
	ReaderPostEntityPost,
	updateReaderPostLocalState,
	updateReaderPostLocalStateMatching,
	upsertReaderPostEntities,
} from './reader-post-entities';
import type { QueryClient } from '@tanstack/react-query';
import type { Middleware } from 'redux';

type ReaderPostEntityAction = {
	type: string;
	siteId?: number;
	postId?: number;
	iLike?: boolean;
	found?: number;
	likeCount?: number;
	globalIds?: string[];
	posts?: Array< ReaderPostEntityPost | null | undefined >;
	payload?: {
		siteId?: number;
		postId?: number;
		followStatus?: string;
	};
	meta?: {
		source?: string;
	};
};

type GetQueryClient = () => QueryClient | null;

const currentLikeCount = ( post: ReaderPostEntityPost | null ): number => {
	return typeof post?.like_count === 'number' ? post.like_count : 0;
};

const patchLikeState = ( queryClient: QueryClient, action: ReaderPostEntityAction ) => {
	if ( ! action.siteId || ! action.postId ) {
		return;
	}
	if ( action.type === POST_LIKES_RECEIVE && action.meta?.source === READER_POSTS_RECEIVE ) {
		return;
	}

	updateReaderPostLocalState(
		queryClient,
		{ blogId: action.siteId, postId: action.postId },
		( post ) => {
			switch ( action.type ) {
				case POST_LIKE:
					return {
						i_like: true,
						like_count: currentLikeCount( post ) + ( post?.i_like ? 0 : 1 ),
					};
				case POST_UNLIKE:
					return {
						i_like: false,
						like_count: Math.max( 0, currentLikeCount( post ) - ( post?.i_like ? 1 : 0 ) ),
					};
				case POST_LIKES_RECEIVE:
					return { i_like: Boolean( action.iLike ), like_count: action.found ?? 0 };
				case POST_LIKES_ADD_LIKER:
				case POST_LIKES_REMOVE_LIKER:
					return {};
			}

			return {};
		}
	);
};

const patchSeenState = ( queryClient: QueryClient, action: ReaderPostEntityAction ) => {
	const globalIds = new Set( action.globalIds );
	if ( ! globalIds.size ) {
		return;
	}

	const isSeen =
		action.type === READER_SEEN_MARK_AS_SEEN_RECEIVE ||
		action.type === READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE;

	updateReaderPostLocalStateMatching(
		queryClient,
		( post ) => typeof post.global_ID === 'string' && globalIds.has( post.global_ID ),
		() => ( { is_seen: isSeen } )
	);
};

const patchConversationState = ( queryClient: QueryClient, action: ReaderPostEntityAction ) => {
	const { siteId, postId, followStatus } = action.payload ?? {};
	if ( ! siteId || ! postId ) {
		return;
	}

	updateReaderPostLocalState( queryClient, { blogId: siteId, postId }, () => ( {
		is_following_conversation: followStatus === CONVERSATION_FOLLOW_STATUS.following,
	} ) );
};

export const createReaderPostEntitiesMiddleware =
	( getQueryClient: GetQueryClient = getCalypsoQueryClient ): Middleware =>
	() =>
	( next ) =>
	( action: unknown ) => {
		const result = next( action );
		const readerAction = action as ReaderPostEntityAction;
		const queryClient = getQueryClient();

		if ( ! queryClient ) {
			return result;
		}

		switch ( readerAction.type ) {
			case POST_LIKE:
			case POST_UNLIKE:
			case POST_LIKES_RECEIVE:
			case POST_LIKES_ADD_LIKER:
			case POST_LIKES_REMOVE_LIKER:
				patchLikeState( queryClient, readerAction );
				break;
			case READER_SEEN_MARK_AS_SEEN_RECEIVE:
			case READER_SEEN_MARK_AS_UNSEEN_RECEIVE:
			case READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE:
				patchSeenState( queryClient, readerAction );
				break;
			case READER_CONVERSATION_UPDATE_FOLLOW_STATUS:
				patchConversationState( queryClient, readerAction );
				break;
			case READER_POSTS_RECEIVE:
				upsertReaderPostEntities( queryClient, readerAction.posts ?? [] );
				break;
		}

		return result;
	};

export default createReaderPostEntitiesMiddleware();
