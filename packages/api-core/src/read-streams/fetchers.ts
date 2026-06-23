import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadStreamQueryParams, ReadStreamResponse } from './types';

// READ-485: streams migrated incrementally. Keep each fetcher aligned with
// its legacy data-layer `path`, `apiVersion`, `apiNamespace`, and query shape
// when moving a stream into React Query.
export const fetchReadFollowing = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/following', params ),
		apiVersion: '1.2',
		method: 'GET',
	} );

/**
 * Fetch the `recent` stream — `/read/streams/following` on `wpcom/v2`. The
 * caller passes `feed_id` in `params` when filtering by a specific feed; the
 * thunk derives that from the streamKey suffix.
 */
export const fetchReadRecent = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/streams/following', params ),
		apiNamespace: 'wpcom/v2',
		method: 'GET',
	} );

/**
 * Fetch the `search` stream. Caller is responsible for passing `q` and `sort`
 * in `params` (the streamKey suffix is `JSON.parse`-able to `{ sort, q }`).
 */
export const fetchReadSearch = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/search', params ),
		apiVersion: '1.2',
		method: 'GET',
	} );

/**
 * Fetch a single feed's posts — `/read/feed/{feedId}/posts`.
 */
export const fetchReadFeedPosts = (
	feedId: string | number,
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( `/read/feed/${ feedId }/posts`, params ),
		apiVersion: '1.2',
		method: 'GET',
	} );

/**
 * Fetch a single site's posts — `/read/sites/{siteId}/posts`.
 */
export const fetchReadSitePosts = (
	siteId: string | number,
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( `/read/sites/${ siteId }/posts`, params ),
		apiVersion: '1.2',
		method: 'GET',
	} );

/**
 * Fetch a Reader Space's posts feed — `/reader/spaces/{spaceId}/posts` on
 * `wpcom/v2`. The backend builds the stream from the Space's followed feeds
 * (and tags), returning the standard `{ cards, next_page_handle }` stream shape
 * so the Reader consumes it like any other stream. `count` is capped at 15
 * server-side; paginate with the returned `page_handle`.
 */
export const fetchReadSpacePosts = (
	spaceId: string | number,
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		// Encode the id into the path segment: it arrives as a string (from the
		// `space:<id>` stream key), so harden against a stray separator even though
		// today's ids are numeric — `addQueryArgs` only encodes the query string.
		path: addQueryArgs( `/reader/spaces/${ encodeURIComponent( spaceId ) }/posts`, params ),
		apiNamespace: 'wpcom/v2',
		method: 'GET',
	} );

/**
 * Fetch the `notifications` stream — `/read/notifications`.
 */
export const fetchReadNotifications = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/notifications', params ),
		apiVersion: '1.2',
		method: 'GET',
	} );

/**
 * Fetch a site's featured posts — `/read/sites/{siteId}/featured`.
 */
export const fetchReadSiteFeatured = (
	siteId: string | number,
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( `/read/sites/${ siteId }/featured`, params ),
		apiVersion: '1.2',
		method: 'GET',
	} );

/**
 * Fetch the `p2` stream — followed P2 sites at `/read/following/p2`.
 */
export const fetchReadFollowingP2 = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/following/p2', params ),
		apiVersion: '1.2',
		method: 'GET',
	} );

/**
 * Fetch the `a8c` stream — Automattic-internal posts at `/read/a8c`.
 */
export const fetchReadA8c = ( params: ReadStreamQueryParams = {} ): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/a8c', params ),
		apiVersion: '1.2',
		method: 'GET',
	} );

/**
 * Fetch a tag's posts — `/read/tags/{slug}/posts` on `wpcom/v2`.
 */
export const fetchReadTagPosts = (
	tagSlug: string,
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( `/read/tags/${ encodeURIComponent( tagSlug ) }/posts`, params ),
		apiNamespace: 'wpcom/v2',
		method: 'GET',
	} );

/**
 * Fetch a tag's popular stream — `/read/streams/tag/{tag}` on `wpcom/v2`.
 */
export const fetchReadTagPopular = (
	tag: string,
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( `/read/streams/tag/${ encodeURIComponent( tag ) }`, params ),
		apiNamespace: 'wpcom/v2',
		method: 'GET',
	} );

/**
 * Fetch a Reader list's posts — `/read/list/{owner}/{slug}/posts`. Named with
 * the `Posts` suffix to avoid colliding with `fetchReadList` in
 * `packages/api-core/src/read-lists/fetchers.ts`, which fetches the list's
 * metadata.
 */
export const fetchReadListPosts = (
	owner: string,
	slug: string,
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs(
			`/read/list/${ encodeURIComponent( owner ) }/${ encodeURIComponent( slug ) }/posts`,
			params
		),
		apiVersion: '1.3',
		method: 'GET',
	} );

/**
 * Fetch a user's posts — `/users/{userId}/posts`. The legacy data-layer used
 * REST `1` (no `.2`) for this endpoint; preserve that.
 */
export const fetchReadUserPosts = (
	userId: string | number,
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( `/users/${ userId }/posts`, params ),
		apiVersion: '1',
		method: 'GET',
	} );

/**
 * Fetch the `on_this_day` stream — `/read/streams/on-this-day` on `wpcom/v2`.
 * The thunk derives the optional `month`/`day` from the streamKey suffix and
 * passes them via `params`.
 */
export const fetchReadOnThisDay = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/streams/on-this-day', params ),
		apiNamespace: 'wpcom/v2',
		method: 'GET',
	} );

/**
 * Fetch the discover (`recommended` sub-tab) stream.
 *
 * Hits `/read/streams/discover` on the `wpcom/v2` namespace.
 */
export const fetchReadDiscoverRecommended = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/streams/discover', params ),
		apiNamespace: 'wpcom/v2',
		method: 'GET',
	} );

/**
 * Fetch the discover `latest` sub-tab — recent posts across followed/default
 * tags. Hits `/read/tags/posts` on the `wpcom/v2` namespace.
 */
export const fetchReadDiscoverLatest = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/tags/posts', params ),
		apiNamespace: 'wpcom/v2',
		method: 'GET',
	} );

/**
 * Fetch the discover `tags:<tag>` sub-tab — `/read/streams/discover` with a
 * single tag in the `tags` query parameter. Forces `tags=<tag>` over whatever
 * the caller passed (the thunk always populates `tags` from the streamKey, but
 * for this sub-tab the suffix *is* the tag, so it has to win).
 */
export const fetchReadDiscoverTags = (
	tag: string,
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/streams/discover', { ...params, tags: tag } ),
		apiNamespace: 'wpcom/v2',
		method: 'GET',
	} );

/**
 * Fetch the `/freshly-pressed` stream. Unlike the other discover sub-tabs this
 * one uses REST `1.2` without a namespace and ignores the discover-specific
 * extras (tags/age decay/etc.).
 */
export const fetchReadDiscoverFreshlyPressed = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/freshly-pressed', params ),
		apiVersion: '1.2',
		method: 'GET',
	} );

/**
 * Fetch the `likes` stream — posts the current user has liked. Hits
 * `/read/liked` on REST `1.2`. The API orders results by `date_liked`
 * (the `dateProperty` the thunk uses to build `streamItems`).
 */
export const fetchReadLiked = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/liked', params ),
		apiVersion: '1.2',
		method: 'GET',
	} );

/**
 * Fetch the `conversations` stream — `/read/conversations`. Calypso stream
 * query params pass `comments_per_post: 20` and (for the a8c variant)
 * `index: 'a8c'`, mirroring the legacy `streamApis.conversations` definition.
 * Pagination is date-based via `last_comment_date_gmt` on the response.
 */
export const fetchReadConversations = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/conversations', params ),
		apiVersion: '1.2',
		method: 'GET',
	} );

/**
 * Fetch the `recommendations_posts` and `custom_recs_posts_with_images`
 * streams — both hit `/read/recommendations/posts`. The differentiator is in
 * the query params (algorithm vs. alg_prefix, plus `seed`), which Calypso
 * builds per stream type and passes through. Pagination is offset-based (see
 * `extractPageHandle` in `client/reader/data/stream/normalization/helpers.ts`).
 */
export const fetchReadRecommendationsPosts = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/recommendations/posts', params ),
		apiVersion: '1.2',
		method: 'GET',
	} );

/**
 * Fetch the `custom_recs_sites_with_images` stream —
 * `/read/recommendations/sites`. Returns `{ sites: [...] }` (each site
 * carrying its top post under `posts[0]`). Capped at 10 sites per request,
 * which the thunk enforces via the poll-query branch in
 * `buildStreamQueryParams`.
 */
export const fetchReadRecommendationsSites = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/recommendations/sites', params ),
		apiVersion: '1.2',
		method: 'GET',
	} );
