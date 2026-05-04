import {
	fetchReadDiscoverFreshlyPressed,
	fetchReadDiscoverLatest,
	fetchReadDiscoverRecommended,
	fetchReadDiscoverTags,
	fetchReadFollowing,
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
 * Migrated so far: `following` and every `discover:*` sub-tab. The remaining
 * stream types (`recent`, `feed`, `site`, `featured`, `tag`, `tag_popular`,
 * `p2`, `a8c`, `likes`, `notifications`, `user`, `on_this_day`, `search`,
 * `list`, `conversations`, `conversations-a8c`, `recommendations_posts`,
 * `custom_recs_*`) are migrated incrementally in the follow-up PRs of this
 * same task — each PR adds the fetcher in `@automattic/api-core`, a case in
 * the switch below, and the streamType to the `isMigratedStream` gate in
 * `client/state/reader/streams/migrated-stream-types.ts`. Until then those
 * streams keep flowing through the legacy data-layer at
 * `client/state/data-layer/wpcom/read/streams/index.js` and never reach this
 * factory.
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
			switch ( streamType ) {
				case 'following':
					return fetchReadFollowing( queryParams );
				case 'discover':
					return fetchDiscover( streamKey, queryParams );
				default:
					throw new Error(
						`readStreamQuery: unsupported streamType "${ streamType }". Add the fetcher in @automattic/api-core and a case here when migrating this stream.`
					);
			}
		},
		staleTime: STREAM_STALE_TIME,
		meta: { persist: false },
	} );
