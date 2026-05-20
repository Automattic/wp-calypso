import { postLikesQuery } from '@automattic/api-queries';
import { updateConversationFollowStatus } from 'calypso/state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import { runFastRules, runSlowRules } from 'calypso/state/reader/posts/normalization-rules';
import { ReaderPostCachePost, upsertReaderPostCache } from './reader-post-cache';
import type { QueryClient } from '@tanstack/react-query';
import type { Dispatch } from 'redux';

const numberValue = ( value: unknown ): number | null => {
	if ( value === undefined || value === null || value === '' ) {
		return null;
	}

	const number = Number( value );
	return Number.isFinite( number ) ? number : null;
};

const seedPostLikesQueries = (
	queryClient: QueryClient,
	posts: Array< ReaderPostCachePost | null | undefined >
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

const hideRejections = ( promise: Promise< ReaderPostCachePost > ) => promise.catch( () => null );

const normalizeReaderPosts = ( posts: Array< ReaderPostCachePost | null | undefined > ) =>
	posts
		.filter( Boolean )
		.filter( ( post ) => ! post?._should_reload )
		.map( ( post ) => runFastRules( post ) as ReaderPostCachePost );

export const syncReaderPostCache = (
	queryClient: QueryClient,
	posts: Array< ReaderPostCachePost | null | undefined >
) => {
	const normalizedPosts = normalizeReaderPosts( posts );
	upsertReaderPostCache( queryClient, normalizedPosts );
	seedPostLikesQueries( queryClient, normalizedPosts );

	void Promise.all(
		normalizedPosts.map( ( post ) => hideRejections( runSlowRules( post ) ) )
	).then( ( processedPosts ) => {
		upsertReaderPostCache( queryClient, processedPosts.filter( Boolean ) );
	} );
};

export const syncReaderConversationFollowStatus = (
	dispatch: Dispatch,
	posts: Array< ReaderPostCachePost | null | undefined >
) => {
	for ( const post of posts ) {
		if ( ! post?.is_following_conversation ) {
			continue;
		}

		const siteId = numberValue( post.site_ID );
		const postId = numberValue( post.ID );
		if ( ! siteId || ! postId ) {
			continue;
		}

		dispatch(
			updateConversationFollowStatus( {
				siteId,
				postId,
				followStatus: CONVERSATION_FOLLOW_STATUS.following,
			} )
		);
	}
};
