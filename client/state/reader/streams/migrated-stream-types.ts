/**
 * Stream types that route through the React Query thunk wrapper instead of the
 * legacy `dispatchRequest`-based data-layer in
 * `client/state/data-layer/wpcom/read/streams/index.js`.
 *
 * Each PR in the READ-485 migration adds entries here once the matching fetcher
 * exists in `@automattic/api-core` and is wired into `readStreamQuery` in
 * `@automattic/api-queries`. When this set covers every stream type, the gate
 * and the legacy data-layer file are removed in the cleanup PR.
 */
export const MIGRATED_STREAM_TYPES: ReadonlySet< string > = new Set( [ 'following' ] );
