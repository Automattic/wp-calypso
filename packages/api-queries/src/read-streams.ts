import {
	fetchReadA8c,
	fetchReadConversations,
	fetchReadDiscoverFreshlyPressed,
	fetchReadDiscoverLatest,
	fetchReadDiscoverRecommended,
	fetchReadDiscoverTags,
	fetchReadFeedPosts,
	fetchReadFollowing,
	fetchReadFollowingP2,
	fetchReadLiked,
	fetchReadListPosts,
	fetchReadNotifications,
	fetchReadOnThisDay,
	fetchReadRecent,
	fetchReadSearch,
	fetchReadSiteFeatured,
	fetchReadSitePosts,
	fetchReadTagPopular,
	fetchReadTagPosts,
	fetchReadUserPosts,
	type ReadStreamQueryParams,
	type ReadStreamResponse,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

const STREAM_STALE_TIME = 30 * 1000;

const getStreamType = ( streamKey: string ): string => {
	const colon = streamKey.indexOf( ':' );
	return colon === -1 ? streamKey : streamKey.substring( 0, colon );
};

const streamKeySuffix = ( streamKey: string ): string =>
	streamKey.substring( streamKey.indexOf( ':' ) + 1 );

const fetchDiscover = (
	streamKey: string,
	queryParams: ReadStreamQueryParams
): Promise< ReadStreamResponse > => {
	const suffix = streamKeySuffix( streamKey );
	if ( suffix.startsWith( 'recommended' ) ) {
		return fetchReadDiscoverRecommended( queryParams );
	}
	if ( suffix.startsWith( 'latest' ) ) {
		return fetchReadDiscoverLatest( queryParams );
	}
	if ( suffix === 'freshly-pressed' ) {
		return fetchReadDiscoverFreshlyPressed( queryParams );
	}
	// Tag fallback: anything else (e.g. `discover:dailyprompt`) is treated as a
	// single-tag query against `/read/streams/discover?tags=<suffix>`.
	return fetchReadDiscoverTags( suffix, queryParams );
};

/**
 * React Query factory for Reader stream pages (READ-485).
 *
 * Migrated: `following`, every `discover:*` sub-tab, plus `recent`, `search`,
 * `feed`, `site`, `notifications`, `featured`, `p2`, `a8c`, `tag`,
 * `tag_popular`, `list`, `on_this_day`, `user`, `conversations`,
 * `conversations-a8c`, and `likes`. Streams still served by the legacy
 * data-layer: `recommendations_posts`, `custom_recs_*`. Those will land in a
 * final cleanup PR that also deletes the data-layer file.
 */
export const readStreamQuery = (
	streamKey: string,
	queryParams: ReadStreamQueryParams,
	pageHandle: unknown = null
) =>
	queryOptions< ReadStreamResponse >( {
		queryKey: [ 'read', 'stream', streamKey, pageHandle ?? null ],
		queryFn: () => {
			const streamType = getStreamType( streamKey );
			const suffix = streamKeySuffix( streamKey );
			switch ( streamType ) {
				case 'following':
					return fetchReadFollowing( queryParams );
				case 'discover':
					return fetchDiscover( streamKey, queryParams );
				case 'recent':
					return fetchReadRecent( queryParams );
				case 'search':
					return fetchReadSearch( queryParams );
				case 'feed':
					return fetchReadFeedPosts( suffix, queryParams );
				case 'site':
					return fetchReadSitePosts( suffix, queryParams );
				case 'notifications':
					return fetchReadNotifications( queryParams );
				case 'featured':
					return fetchReadSiteFeatured( suffix, queryParams );
				case 'p2':
					return fetchReadFollowingP2( queryParams );
				case 'a8c':
					return fetchReadA8c( queryParams );
				case 'tag':
					return fetchReadTagPosts( suffix, queryParams );
				case 'tag_popular':
					return fetchReadTagPopular( suffix, queryParams );
				case 'list': {
					const { owner, slug } = JSON.parse( suffix ) as { owner: string; slug: string };
					return fetchReadListPosts( owner, slug, queryParams );
				}
				case 'user':
					return fetchReadUserPosts( suffix, queryParams );
				case 'on_this_day':
					return fetchReadOnThisDay( queryParams );
				case 'conversations':
				case 'conversations-a8c':
					return fetchReadConversations( queryParams );
				case 'likes':
					return fetchReadLiked( queryParams );
				default:
					throw new Error(
						`readStreamQuery: unsupported streamType "${ streamType }". Add the fetcher in @automattic/api-core and a case here when migrating this stream.`
					);
			}
		},
		staleTime: STREAM_STALE_TIME,
		meta: { persist: false },
	} );
