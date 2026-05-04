import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadStreamQueryParams, ReadStreamResponse } from './types';

// READ-485: streams migrated incrementally. Streams still served by the
// legacy data-layer at `client/state/data-layer/wpcom/read/streams/index.js`:
// `likes`, `recommendations_posts`, `custom_recs_posts_with_images`,
// `custom_recs_sites_with_images`. See the legacy `streamApis` map for their
// canonical per-shape `path`, `apiVersion`, `apiNamespace`, and `query`
// definitions to mirror when porting each one.
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
 * Fetch the `conversations` stream — `/read/conversations`. The thunk in
 * `client/state/reader/streams/actions.js` always passes `comments_per_post: 20`
 * and (for the a8c variant) `index: 'a8c'` in `params`, mirroring the legacy
 * `streamApis.conversations` definition. Pagination is date-based via
 * `last_comment_date_gmt` on the response.
 */
export const fetchReadConversations = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/conversations', params ),
		apiVersion: '1.2',
		method: 'GET',
	} );
