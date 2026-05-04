/**
 * Stream types that route through the React Query thunk wrapper in
 * `client/state/reader/streams/actions.js` instead of the legacy
 * `dispatchRequest`-based data-layer in
 * `client/state/data-layer/wpcom/read/streams/index.js`.
 *
 * Each PR in the READ-485 migration extends this once the matching fetcher
 * exists in `@automattic/api-core` and is wired into `readStreamQuery` in
 * `@automattic/api-queries`. Streams still served by the legacy data-layer:
 * `recommendations_posts`, `custom_recs_posts_with_images`,
 * `custom_recs_sites_with_images`. Those land in a final cleanup PR that
 * deletes the data-layer file entirely.
 */
const MIGRATED_STREAM_TYPES: ReadonlySet< string > = new Set( [
	'following',
	'discover',
	'recent',
	'search',
	'feed',
	'site',
	'notifications',
	'featured',
	'p2',
	'a8c',
	'tag',
	'tag_popular',
	'list',
	'on_this_day',
	'user',
	'conversations',
	'conversations-a8c',
	'likes',
] );

export function isMigratedStream( streamType: string ): boolean {
	return MIGRATED_STREAM_TYPES.has( streamType );
}
