import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadStreamQueryParams, ReadStreamResponse } from './types';

// READ-485: only `following` is migrated in this PR. The remaining 18+ Reader
// stream shapes (`recent`, `feed`, `site`, `featured`, `tag`, `tag_popular`,
// `p2`, `a8c`, `likes`, `notifications`, `user`, `on_this_day`, `discover:*`,
// `search`, `list`, `conversations`, `conversations-a8c`,
// `recommendations_posts`, `custom_recs_*`) are added here incrementally by
// the follow-up PRs of this same task. See the legacy `streamApis` map in
// `client/state/data-layer/wpcom/read/streams/index.js` for the canonical
// per-shape `path`, `apiVersion`, `apiNamespace`, and `query` definitions to
// mirror when porting each one.
export const fetchReadFollowing = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/following', params ),
		apiVersion: '1.2',
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
