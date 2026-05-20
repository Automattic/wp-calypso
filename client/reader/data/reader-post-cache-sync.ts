import { postLikesQuery, readerPostQuery } from '@automattic/api-queries';
import readerContentWidth from 'calypso/reader/lib/content-width';
import { keyForPost } from 'calypso/reader/post-key';
import { updateConversationFollowStatus } from 'calypso/state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import { runFastRules, runSlowRules } from 'calypso/state/reader/posts/normalization-rules';
import { ReaderPostCachePost, upsertReaderPostCache } from './reader-post-cache';
import type { ReadPostKey } from '@automattic/api-core';
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

export const normalizeReaderPostsForCache = (
	posts: Array< ReaderPostCachePost | null | undefined >
) =>
	posts
		.filter( Boolean )
		.filter( ( post ) => ! post?._should_reload )
		.map( ( post ) => runFastRules( post ) as ReaderPostCachePost );

export const syncNormalizedReaderPostCache = (
	queryClient: QueryClient,
	normalizedPosts: Array< ReaderPostCachePost | null | undefined >
) => {
	upsertReaderPostCache( queryClient, normalizedPosts );
	seedPostLikesQueries( queryClient, normalizedPosts );
};

function reloadReaderPostIntoCache( queryClient: QueryClient, post: ReaderPostCachePost ) {
	const railcar = post.railcar;
	const postKey = keyForPost( post ) as ReadPostKey;

	if (
		! postKey?.postId ||
		( ! ( 'blogId' in postKey && postKey.blogId ) && ! ( 'feedId' in postKey && postKey.feedId ) )
	) {
		return;
	}

	void queryClient
		.fetchQuery( { ...readerPostQuery( postKey, readerContentWidth() ), staleTime: 0 } )
		.then( ( data ) =>
			syncReaderPostCache( queryClient, [ { ...data, ...( railcar ? { railcar } : {} ) } ] )
		)
		.catch( () => null );
}

export function syncReaderPostCache(
	queryClient: QueryClient,
	posts: Array< ReaderPostCachePost | null | undefined >
) {
	posts
		.filter( ( post ) => post?._should_reload )
		.forEach( ( post ) => {
			reloadReaderPostIntoCache( queryClient, post as ReaderPostCachePost );
		} );

	const normalizedPosts = normalizeReaderPostsForCache( posts );
	syncNormalizedReaderPostCache( queryClient, normalizedPosts );

	void Promise.all(
		normalizedPosts.map( ( post ) => hideRejections( runSlowRules( post ) ) )
	).then( ( processedPosts ) => {
		syncNormalizedReaderPostCache( queryClient, processedPosts.filter( Boolean ) );
	} );
}

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
