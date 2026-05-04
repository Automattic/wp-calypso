/**
 * Stream types that route through the React Query thunk wrapper in
 * `client/state/reader/streams/actions.js` instead of the legacy
 * `dispatchRequest`-based data-layer in
 * `client/state/data-layer/wpcom/read/streams/index.js`.
 *
 * Each PR in the READ-485 migration extends this once the matching fetcher
 * exists in `@automattic/api-core` and is wired into `readStreamQuery` in
 * `@automattic/api-queries`. When every stream type is covered the gate and
 * the legacy data-layer file are removed in the cleanup PR.
 */
const MIGRATED_STREAM_TYPES: ReadonlySet< string > = new Set( [ 'following', 'discover' ] );

export function isMigratedStream( streamType: string ): boolean {
	return MIGRATED_STREAM_TYPES.has( streamType );
}
