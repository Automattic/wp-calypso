import { postLikesQuery, readerPostQuery } from '@automattic/api-queries';
import readerContentWidth from 'calypso/reader/lib/content-width';
import { keyForPost } from 'calypso/reader/post-key';
import { updateConversationFollowStatus } from 'calypso/state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import { runFastRules, runSlowRules } from 'calypso/state/reader/posts/normalization-rules';
import { ReaderPost, upsertPostCache } from './post-cache';
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
	posts: Array< ReaderPost | null | undefined >
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

const hideRejections = ( promise: Promise< ReaderPost > ) => promise.catch( () => null );

type SlowNormalizationQueue = {
	postsByKey: Map< string, ReaderPost >;
	scheduled: boolean;
};

const slowNormalizationQueues = new WeakMap< QueryClient, SlowNormalizationQueue >();

const cacheKeyForPost = ( post: ReaderPost ): string | null => {
	if ( typeof post.global_ID === 'string' && post.global_ID ) {
		return post.global_ID;
	}

	const key = keyForPost( post );
	if ( ! key ) {
		return null;
	}

	return JSON.stringify( key );
};

export const normalizePostsForCache = ( posts: Array< ReaderPost | null | undefined > ) =>
	posts
		.filter( Boolean )
		.filter( ( post ) => ! post?._should_reload )
		.map( ( post ) => runFastRules( post ) as ReaderPost );

export const syncNormalizedPostCache = (
	queryClient: QueryClient,
	normalizedPosts: Array< ReaderPost | null | undefined >
) => {
	upsertPostCache( queryClient, normalizedPosts );
	seedPostLikesQueries( queryClient, normalizedPosts );
};

const scheduleSlowNormalization = ( queryClient: QueryClient, normalizedPosts: ReaderPost[] ) => {
	let queue = slowNormalizationQueues.get( queryClient );
	if ( ! queue ) {
		queue = { postsByKey: new Map(), scheduled: false };
		slowNormalizationQueues.set( queryClient, queue );
	}

	for ( const post of normalizedPosts ) {
		const key = cacheKeyForPost( post );
		if ( key ) {
			queue.postsByKey.set( key, post );
		}
	}

	if ( queue.scheduled ) {
		return;
	}

	queue.scheduled = true;
	void Promise.resolve().then( () => {
		const posts = [ ...queue.postsByKey.values() ];
		queue.postsByKey.clear();
		queue.scheduled = false;

		void Promise.all( posts.map( ( post ) => hideRejections( runSlowRules( post ) ) ) ).then(
			( processedPosts ) => {
				syncNormalizedPostCache( queryClient, processedPosts.filter( Boolean ) );
			}
		);
	} );
};

function reloadPostIntoCache( queryClient: QueryClient, post: ReaderPost ) {
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
			syncPostCache( queryClient, [ { ...data, ...( railcar ? { railcar } : {} ) } ] )
		)
		.catch( () => null );
}

export function syncPostCache(
	queryClient: QueryClient,
	posts: Array< ReaderPost | null | undefined >
) {
	const normalizedPosts = posts.reduce< ReaderPost[] >( ( normalized, post ) => {
		if ( ! post ) {
			return normalized;
		}

		if ( post._should_reload ) {
			reloadPostIntoCache( queryClient, post );
			return normalized;
		}

		normalized.push( runFastRules( post ) as ReaderPost );
		return normalized;
	}, [] );
	syncNormalizedPostCache( queryClient, normalizedPosts );
	scheduleSlowNormalization( queryClient, normalizedPosts );
}

export const syncConversationFollowStatus = (
	dispatch: Dispatch,
	posts: Array< ReaderPost | null | undefined >
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
