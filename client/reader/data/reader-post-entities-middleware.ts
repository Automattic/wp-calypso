import { postLikesQuery } from '@automattic/api-queries';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import {
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
	READER_POSTS_RECEIVE,
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
	globalIds?: string[];
	posts?: Array< ReaderPostEntityPost | null | undefined >;
	payload?: {
		siteId?: number;
		postId?: number;
		followStatus?: string;
	};
};

type GetQueryClient = () => QueryClient | null;

const numberValue = ( value: unknown ): number | null => {
	if ( value === undefined || value === null || value === '' ) {
		return null;
	}

	const number = Number( value );
	return Number.isFinite( number ) ? number : null;
};

const seedPostLikesQueries = (
	queryClient: QueryClient,
	posts: Array< ReaderPostEntityPost | null | undefined >
) => {
	for ( const post of posts ) {
		if ( ! post || post.is_external ) {
			continue;
		}

		const siteId = numberValue( post.site_ID );
		const postId = numberValue( post.ID );
		if ( ! siteId || ! postId ) {
			continue;
		}

		const query = postLikesQuery( siteId, postId );
		queryClient.setQueryDefaults( query.queryKey, {
			staleTime: query.staleTime,
			refetchInterval: query.refetchInterval,
			meta: query.meta,
		} );
		const key = query.queryKey;
		if ( queryClient.getQueryData( key ) ) {
			continue;
		}

		queryClient.setQueryData(
			key,
			{
				found: numberValue( post.like_count ) ?? 0,
				iLike: Boolean( post.i_like ),
				likes: [],
			},
			{ updatedAt: 0 }
		);
	}
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
				seedPostLikesQueries( queryClient, readerAction.posts ?? [] );
				break;
		}

		return result;
	};

export default createReaderPostEntitiesMiddleware();
