import { fetchReadStream, getStreamType } from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { EVERY_MINUTE } from 'calypso/lib/interval';
import { keyToString } from 'calypso/reader/post-key';
import { useDispatch } from 'calypso/state';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { buildStreamQueryParams } from 'calypso/state/reader/streams/build-query-params';
import { normalizeStreamPage } from './stream-normalization';
import { getStreamInfiniteQueryKey } from './use-stream-posts';
import type { PageHandle, PostKey } from './use-stream-posts';
import type { ReadStreamQueryParams, ReadStreamResponse } from '@automattic/api-core';

interface UseStreamPendingPostsOptions {
	streamKey: string;
	feedId?: number | null;
	localeSlug?: string | null;
	startDate?: string | null;
	/**
	 * Whether the head poll should run. Callers exclude stream types where
	 * polling adds no value (search, recommendations, discover) or where the
	 * stream itself is suppressed (`forcePlaceholders`).
	 */
	shouldPoll?: boolean;
	/**
	 * Currently rendered items, used to compute how many polled head items are
	 * "new" (not yet visible). Coming from `useStreamPosts(...)` upstream.
	 */
	items: PostKey[];
}

export interface UseStreamPendingPostsResult {
	/** Number of polled head items not yet present in `items`. */
	pendingCount: number;
	/**
	 * Promote the polled head into the infinite cache (replacing `pages[0]`)
	 * and clear the pending counter. The infinite query is left untouched
	 * otherwise — no full refetch.
	 */
	consumePending: () => void;
}

type PollHeadQueryKey = readonly [
	'read',
	'stream',
	'poll-head',
	string,
	number | null,
	string | null,
	string | null,
];

const postKeyId = ( postKey: PostKey | null | undefined ): string =>
	postKey ? keyToString( postKey ) ?? '' : '';

/**
 * Drives the "X new posts" pill. A separate `useQuery` polls the head of the
 * stream every minute (`refetchInterval`); the diff between the polled head
 * and the currently visible items is exposed as `pendingCount`. The polled
 * payload carries full post bodies (see `getQueryStringForPoll`), and is
 * dispatched into `state.reader.posts` on every tick so `<PostLifecycle>`
 * resolves rich cards immediately when `consumePending` swaps the head into
 * `pages[0]` of the infinite cache.
 */
export function useStreamPendingPosts( {
	streamKey,
	feedId = null,
	localeSlug = null,
	startDate = null,
	shouldPoll = true,
	items,
}: UseStreamPendingPostsOptions ): UseStreamPendingPostsResult {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const streamType = getStreamType( streamKey );

	const pollQueryKey = useMemo< PollHeadQueryKey >(
		() => [ 'read', 'stream', 'poll-head', streamKey, feedId, localeSlug, startDate ] as const,
		[ streamKey, feedId, localeSlug, startDate ]
	);
	const infiniteQueryKey = useMemo(
		() => getStreamInfiniteQueryKey( { streamKey, feedId, localeSlug, startDate } ),
		[ streamKey, feedId, localeSlug, startDate ]
	);

	// Wait for the initial infinite-query page to land before polling — the
	// pending count is meaningless until we have a baseline of "what is shown".
	const enabled = shouldPoll && items.length > 0;

	const pollHead = useQuery< ReadStreamResponse >( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: pollQueryKey,
		queryFn: () => {
			const params = buildStreamQueryParams( {
				streamKey,
				feedId,
				localeSlug,
				pageHandle: startDate ? { before: startDate } : null,
				isPoll: true,
				gap: null,
				page: undefined,
				perPage: undefined,
			} ) as ReadStreamQueryParams;
			return fetchReadStream( streamKey, params );
		},
		enabled,
		refetchInterval: enabled ? EVERY_MINUTE : false,
		// Skip ticking while the tab is hidden — wakes back up when focused.
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
		staleTime: EVERY_MINUTE,
		// Drop the polled head from cache the moment the consumer unmounts or
		// the queryKey rotates (locale/feed change). Without this, a stale
		// head from a prior stream could briefly inflate the badge.
		gcTime: 0,
		meta: { persist: false },
	} );

	// Hydrate Redux on every poll tick so the post bodies are ready before the
	// user clicks "X new posts". Idempotent — `READER_POSTS_RECEIVE` overwrites
	// by `global_ID`, and the rich poll shape matches what regular fetches
	// return.
	useEffect( () => {
		if ( ! pollHead.data ) {
			return;
		}
		const { streamPosts } = normalizeStreamPage( pollHead.data, streamType );
		if ( streamPosts.length > 0 ) {
			dispatch( receivePosts( streamPosts ) as never );
		}
	}, [ pollHead.data, streamType, dispatch ] );

	const pendingCount = useMemo( () => {
		const head = pollHead.data;
		if ( ! head ) {
			return 0;
		}
		const { streamItems } = normalizeStreamPage( head, streamType );
		if ( streamItems.length === 0 ) {
			return 0;
		}
		const seen = new Set< string >();
		for ( const it of items ) {
			const id = postKeyId( it );
			if ( id ) {
				seen.add( id );
			}
		}
		let count = 0;
		for ( const k of streamItems ) {
			const id = postKeyId( k );
			if ( id && ! seen.has( id ) ) {
				count += 1;
			}
		}
		return count;
	}, [ pollHead.data, items, streamType ] );

	const consumePending = useCallback( () => {
		const head = queryClient.getQueryData< ReadStreamResponse >( pollQueryKey );
		if ( head ) {
			queryClient.setQueryData<
				{ pageParams: PageHandle[]; pages: ReadStreamResponse[] } | undefined
			>( infiniteQueryKey, ( prev ) =>
				prev ? { pageParams: prev.pageParams, pages: [ head, ...prev.pages.slice( 1 ) ] } : prev
			);
		}
		// `resetQueries` flips the active observer's data to undefined right
		// away (so `pendingCount` falls to 0 in this render) and schedules a
		// refetch against the new baseline — typically a no-op since the head
		// we just promoted is what the next poll would have returned.
		queryClient.resetQueries( { queryKey: pollQueryKey, exact: true } );
	}, [ queryClient, pollQueryKey, infiniteQueryKey ] );

	return { pendingCount, consumePending };
}
