import {
	authorizeMastodonConnection,
	completeMastodonConnection,
	createMastodonLike,
	createMastodonPost,
	createMastodonRepost,
	deleteMastodonLike,
	deleteMastodonRepost,
	getMastodonAuthorFeed,
	getMastodonAuthorProfile,
	getMastodonConnection,
	getMastodonConnections,
	getMastodonTagFeed,
	getMastodonThread,
	getMastodonTimeline,
	readerMastodonKeys,
} from '@automattic/api-core';
import {
	infiniteQueryOptions,
	mutationOptions,
	queryOptions,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
	type InfiniteData,
	type QueryClient,
	type QueryKey,
} from '@tanstack/react-query';
import type {
	AuthorizeMastodonConnectionParams,
	CompleteMastodonConnectionParams,
	GetMastodonAuthorFeedParams,
	GetMastodonTagFeedParams,
	GetMastodonTimelineParams,
	MastodonAuthorFeedFilter,
	MastodonAuthorFeedPage,
	MastodonAuthorProfile,
	MastodonAuthorizeResponse,
	MastodonConnectionDetails,
	MastodonConnectionsResponse,
	MastodonCreateConnectionResponse,
	MastodonCreatePostParams,
	MastodonCreatePostResult,
	MastodonError,
	MastodonFeedItem,
	MastodonTagFilter,
	MastodonTagFeedPage,
	MastodonThreadNode,
	MastodonThreadResponse,
	MastodonTimelinePage,
} from '@automattic/api-core';

export const mastodonConnectionsQueryOptions = () =>
	queryOptions< MastodonConnectionsResponse, MastodonError >( {
		queryKey: readerMastodonKeys.connections(),
		queryFn: getMastodonConnections,
		staleTime: 60_000,
	} );

export function useMastodonConnectionsQuery( { enabled }: { enabled?: boolean } = {} ) {
	return useQuery( { ...mastodonConnectionsQueryOptions(), enabled } );
}

export function useAuthorizeMastodonConnectionMutation() {
	return useMutation< MastodonAuthorizeResponse, MastodonError, AuthorizeMastodonConnectionParams >(
		{
			mutationFn: authorizeMastodonConnection,
		}
	);
}

export function useCompleteMastodonConnectionMutation() {
	const client = useQueryClient();
	return useMutation<
		MastodonCreateConnectionResponse,
		MastodonError,
		CompleteMastodonConnectionParams
	>( {
		mutationFn: completeMastodonConnection,
		onSuccess: ( { connection } ) => {
			// Seed the list cache synchronously so the route we `page.replace`
			// to next can resolve the new connection without waiting for a
			// refetch. Without this, MastodonAccountView reads the stale
			// cached list, can't find the new id, and redirects to the
			// landing view — which picks connections[0] instead.
			client.setQueryData< MastodonConnectionsResponse >(
				readerMastodonKeys.connections(),
				( prev ) => {
					const existing = prev?.connections ?? [];
					if ( existing.some( ( c ) => c.id === connection.id ) ) {
						return prev;
					}
					return { connections: [ ...existing, connection ] };
				}
			);
			client.invalidateQueries( { queryKey: readerMastodonKeys.connections() } );
		},
	} );
}

export const mastodonConnectionQueryOptions = ( id: number | null ) =>
	queryOptions< MastodonConnectionDetails, MastodonError >( {
		queryKey: readerMastodonKeys.connection( id ),
		queryFn: () => getMastodonConnection( id as number ),
		enabled: id !== null && id > 0,
		staleTime: 60_000,
	} );

export function useMastodonConnectionQuery( id: number | null ) {
	return useQuery( mastodonConnectionQueryOptions( id ) );
}

export const mastodonTimelineInfiniteQuery = ( connectionId: number ) =>
	infiniteQueryOptions<
		MastodonTimelinePage,
		MastodonError,
		InfiniteData< MastodonTimelinePage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerMastodonKeys.timeline( connectionId ),
		queryFn: ( { pageParam } ) =>
			getMastodonTimeline( { connectionId, cursor: pageParam } as GetMastodonTimelineParams ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage ) => lastPage.cursor ?? undefined,
		enabled: connectionId > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		// Don't retry terminal errors — they won't resolve on their own
		// and a 3x retry just delays the "Reconnect needed" / "Connection
		// not found" copy. Transient errors (rate limits, upstream
		// outages) get one extra attempt with backoff keyed off
		// retry_after where present.
		retry: ( failureCount, error ) => {
			if ( error.kind === 'rate_limited' || error.kind === 'upstream_unavailable' ) {
				return failureCount < 2;
			}
			return false;
		},
		retryDelay: ( _attempt, error ) => {
			if ( error.kind === 'rate_limited' && error.retry_after !== undefined ) {
				return Math.min( error.retry_after * 1000, 30_000 );
			}
			return 2_000;
		},
	} );

export function useMastodonTimelineInfiniteQuery( connectionId: number ) {
	return useInfiniteQuery( mastodonTimelineInfiniteQuery( connectionId ) );
}

export const mastodonThreadQueryOptions = ( connectionId: number, statusId: string ) =>
	queryOptions< MastodonThreadResponse, MastodonError >( {
		queryKey: readerMastodonKeys.thread( connectionId, statusId ),
		queryFn: () => getMastodonThread( { connectionId, statusId } ),
		enabled: connectionId > 0 && statusId.length > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		// Same retry posture as the timeline query: terminal errors
		// fail fast; transient errors (rate-limited, upstream down)
		// retry once with retry_after-aware backoff.
		retry: ( failureCount, error ) => {
			if ( error.kind === 'rate_limited' || error.kind === 'upstream_unavailable' ) {
				return failureCount < 2;
			}
			return false;
		},
		retryDelay: ( _attempt, error ) => {
			if ( error.kind === 'rate_limited' && error.retry_after !== undefined ) {
				return Math.min( error.retry_after * 1000, 30_000 );
			}
			return 2_000;
		},
	} );

export function useMastodonThreadQuery( connectionId: number, statusId: string ) {
	return useQuery( mastodonThreadQueryOptions( connectionId, statusId ) );
}

// Normalize an actor string for cache keying: trim, strip a leading `@`,
// and lowercase. The Mastodon backend's `/lookup` is case-insensitive and
// accepts both with-`@` and without-`@` variants, so a profile reachable as
// `@Alice@MASTODON.social` and `alice@mastodon.social` should hit one cache
// entry rather than two. (Numeric ids and `@user@instance` route segments
// can't always be reduced to the same key without a backend round-trip; we
// dedupe what we can.)
function normalizeActor( actor: string ): string {
	const trimmed = actor.trim();
	const stripped = trimmed.startsWith( '@' ) ? trimmed.slice( 1 ) : trimmed;
	return stripped.toLowerCase();
}

export const mastodonAuthorProfileQueryOptions = ( connectionId: number, actor: string ) => {
	const normalized = normalizeActor( actor );
	return queryOptions< MastodonAuthorProfile, MastodonError >( {
		queryKey: readerMastodonKeys.authorProfile( connectionId, normalized ),
		queryFn: () => getMastodonAuthorProfile( { connectionId, actor: normalized } ),
		enabled: connectionId > 0 && normalized.length > 0,
		staleTime: 60_000,
		gcTime: 5 * 60_000,
		retry: ( failureCount, error ) => {
			if ( error.kind === 'rate_limited' || error.kind === 'upstream_unavailable' ) {
				return failureCount < 2;
			}
			return false;
		},
		retryDelay: ( _attempt, error ) => {
			if ( error.kind === 'rate_limited' && error.retry_after !== undefined ) {
				return Math.min( error.retry_after * 1000, 30_000 );
			}
			return 2_000;
		},
	} );
};

export function useMastodonAuthorProfileQuery( connectionId: number, actor: string ) {
	return useQuery( mastodonAuthorProfileQueryOptions( connectionId, actor ) );
}

export const mastodonAuthorFeedInfiniteQuery = (
	connectionId: number,
	actor: string,
	filter?: MastodonAuthorFeedFilter
) => {
	const normalizedActor = normalizeActor( actor );
	// `posts_with_replies` is the wire default (no filter param); collapse
	// to undefined so callers that pass it share the slice-6 cache key with
	// no-filter callers. `posts_no_replies` and `posts_with_media` survive
	// as distinct dimensions.
	const normalizedFilter: MastodonAuthorFeedFilter | undefined =
		filter === 'posts_with_replies' ? undefined : filter;
	return infiniteQueryOptions<
		MastodonAuthorFeedPage,
		MastodonError,
		InfiniteData< MastodonAuthorFeedPage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerMastodonKeys.authorFeed( connectionId, normalizedActor, normalizedFilter ),
		queryFn: ( { pageParam } ) =>
			getMastodonAuthorFeed( {
				connectionId,
				actor: normalizedActor,
				cursor: pageParam,
				filter: normalizedFilter,
			} as GetMastodonAuthorFeedParams ),
		initialPageParam: undefined,
		// `|| undefined` (not `??`): an empty-string cursor terminates pagination.
		// Atmosphere slice 6 hardened this exact path against an upstream returning ''.
		getNextPageParam: ( lastPage ) => lastPage.cursor || undefined,
		enabled: connectionId > 0 && normalizedActor.length > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		retry: ( failureCount, error ) => {
			if ( error.kind === 'rate_limited' || error.kind === 'upstream_unavailable' ) {
				return failureCount < 2;
			}
			return false;
		},
		retryDelay: ( _attempt, error ) => {
			if ( error.kind === 'rate_limited' && error.retry_after !== undefined ) {
				return Math.min( error.retry_after * 1000, 30_000 );
			}
			return 2_000;
		},
	} );
};

export function useMastodonAuthorFeedInfiniteQuery(
	connectionId: number,
	actor: string,
	filter?: MastodonAuthorFeedFilter
) {
	return useInfiniteQuery( mastodonAuthorFeedInfiniteQuery( connectionId, actor, filter ) );
}

export const mastodonTagFeedInfiniteQuery = (
	connectionId: number,
	hashtag: string,
	filter?: MastodonTagFilter
) => {
	const canonicalHashtag = hashtag.trim().toLowerCase().replace( /^#/, '' );
	// `all` is the wire default (no filter param); collapse to undefined so
	// callers that pass it share one cache entry with no-filter callers.
	const normalizedFilter: MastodonTagFilter | undefined = filter === 'all' ? undefined : filter;
	return infiniteQueryOptions<
		MastodonTagFeedPage,
		MastodonError,
		InfiniteData< MastodonTagFeedPage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerMastodonKeys.tagFeed( connectionId, canonicalHashtag, normalizedFilter ),
		queryFn: ( { pageParam } ) =>
			getMastodonTagFeed( {
				connectionId,
				hashtag: canonicalHashtag,
				cursor: pageParam,
				filter: normalizedFilter,
			} as GetMastodonTagFeedParams ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage ) => lastPage.cursor || undefined,
		enabled: connectionId > 0 && canonicalHashtag.length > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		retry: ( failureCount, error ) => {
			if ( error.kind === 'rate_limited' || error.kind === 'upstream_unavailable' ) {
				return failureCount < 2;
			}
			return false;
		},
		retryDelay: ( _attempt, error ) => {
			if ( error.kind === 'rate_limited' && error.retry_after !== undefined ) {
				return Math.min( error.retry_after * 1000, 30_000 );
			}
			return 2_000;
		},
	} );
};

export function useMastodonTagFeedInfiniteQuery(
	connectionId: number,
	hashtag: string,
	filter?: MastodonTagFilter
) {
	return useInfiniteQuery( mastodonTagFeedInfiniteQuery( connectionId, hashtag, filter ) );
}

// ---------------------------------------------------------------------------
// Optimistic favorite/unfavorite + boost/unboost + post-cache infrastructure
// (private to this file)
// ---------------------------------------------------------------------------

interface OptimisticContext {
	snapshots: Array< {
		key: QueryKey;
		items: Array< { itemKey: string; occurrence: number; item: MastodonFeedItem } >;
	} >;
}

interface FeedPageWithItems {
	items: MastodonFeedItem[];
	[ key: string ]: unknown;
}

function getOptimisticItemKey( item: MastodonFeedItem ): string {
	if ( ! item.boost ) {
		return `${ item.id }\nboost:none`;
	}
	return `${ item.id }\nboost:${ item.boost.by.id }:${ item.boost.by.acct }`;
}

function isObject( value: unknown ): value is Record< string, unknown > {
	return typeof value === 'object' && value !== null;
}

function isInfiniteFeedData( data: unknown ): data is InfiniteData< FeedPageWithItems > {
	if ( ! isObject( data ) || ! Array.isArray( data.pages ) ) {
		return false;
	}
	return data.pages.some(
		( page ) => isObject( page ) && Array.isArray( ( page as { items?: unknown } ).items )
	);
}

function patchFeedItems(
	items: MastodonFeedItem[],
	statusId: string,
	patch: ( item: MastodonFeedItem ) => MastodonFeedItem,
	snapshots: OptimisticContext[ 'snapshots' ][ number ][ 'items' ],
	seenOccurrences: Map< string, number >
): MastodonFeedItem[] {
	return items.map( ( item ) => {
		if ( item.id !== statusId ) {
			return item;
		}
		const itemKey = getOptimisticItemKey( item );
		const occurrence = seenOccurrences.get( itemKey ) ?? 0;
		seenOccurrences.set( itemKey, occurrence + 1 );
		snapshots.push( { itemKey, occurrence, item } );
		return patch( item );
	} );
}

function patchThreadNode(
	node: MastodonThreadNode,
	statusId: string,
	patch: ( item: MastodonFeedItem ) => MastodonFeedItem,
	snapshots: OptimisticContext[ 'snapshots' ][ number ][ 'items' ],
	seenOccurrences: Map< string, number >
): MastodonThreadNode {
	if ( node.type !== 'post' ) {
		return node;
	}

	const beforeSnapshotCount = snapshots.length;
	const post =
		node.post.id === statusId
			? patchFeedItems( [ node.post ], statusId, patch, snapshots, seenOccurrences )[ 0 ]
			: node.post;
	const parent = node.parent
		? patchThreadNode( node.parent, statusId, patch, snapshots, seenOccurrences )
		: null;
	const replies = node.replies.map( ( reply ) =>
		patchThreadNode( reply, statusId, patch, snapshots, seenOccurrences )
	);

	if (
		snapshots.length === beforeSnapshotCount &&
		parent === node.parent &&
		replies.every( ( reply, idx ) => reply === node.replies[ idx ] )
	) {
		return node;
	}

	return { ...node, post, parent, replies };
}

function patchMastodonQueryData(
	data: unknown,
	statusId: string,
	patch: ( item: MastodonFeedItem ) => MastodonFeedItem
): { data: unknown; items: OptimisticContext[ 'snapshots' ][ number ][ 'items' ] } {
	const items: OptimisticContext[ 'snapshots' ][ number ][ 'items' ] = [];
	const seenOccurrences = new Map< string, number >();

	if ( isInfiniteFeedData( data ) ) {
		return {
			items,
			data: {
				...data,
				pages: data.pages.map( ( page ) =>
					Array.isArray( page.items )
						? {
								...page,
								items: patchFeedItems( page.items, statusId, patch, items, seenOccurrences ),
						  }
						: page
				),
			},
		};
	}

	if ( isObject( data ) && isObject( data.thread ) ) {
		return {
			items,
			data: {
				...data,
				thread: patchThreadNode(
					data.thread as unknown as MastodonThreadNode,
					statusId,
					patch,
					items,
					seenOccurrences
				),
			},
		};
	}

	return { data, items };
}

// Mastodon cache keys carry `connectionId` at slot 3 for every query type
// that holds posts (timeline / thread / profile-feed / tag-feed).
// `connections` and `connection` keys don't hold posts so they're silently
// no-op walked. Status IDs are instance-local — same numeric id on a
// different connection is a different post — so the patch must be
// connection-scoped or favorites/boosts on connection A leak into B's caches.
function isQueryKeyForConnection( key: unknown, connectionId: number ): boolean {
	return Array.isArray( key ) && key[ 3 ] === connectionId;
}

function patchMastodonPostCaches(
	queryClient: QueryClient,
	connectionId: number,
	statusId: string,
	patch: ( item: MastodonFeedItem ) => MastodonFeedItem
): OptimisticContext {
	const snapshots: OptimisticContext[ 'snapshots' ] = [];
	for ( const [ key, data ] of queryClient.getQueriesData( {
		queryKey: readerMastodonKeys.all,
	} ) ) {
		if ( ! isQueryKeyForConnection( key, connectionId ) ) {
			continue;
		}
		const result = patchMastodonQueryData( data, statusId, patch );
		if ( ! result.items.length ) {
			continue;
		}
		queryClient.setQueryData( key, result.data );
		snapshots.push( { key, items: result.items } );
	}
	return { snapshots };
}

// Cancel only this connection's in-flight Mastodon queries — favouriting/
// boosting on connection A shouldn't kill connection B's pagination/thread
// loads. Wrapped at call sites in try/catch: if cancelQueries rejects (rare
// — teardown / route change), the optimistic patch should still apply and
// the mutation should still fire.
function cancelMastodonQueriesForConnection( queryClient: QueryClient, connectionId: number ) {
	return queryClient.cancelQueries( {
		predicate: ( query ) => isQueryKeyForConnection( query.queryKey, connectionId ),
	} );
}

function restoreFeedItems(
	items: MastodonFeedItem[],
	itemSnapshots: Map< string, MastodonFeedItem[] >,
	seenOccurrences: Map< string, number >
): MastodonFeedItem[] {
	return items.map( ( item ) => {
		const itemKey = getOptimisticItemKey( item );
		const snapshots = itemSnapshots.get( itemKey );
		if ( ! snapshots ) {
			return item;
		}
		const occurrence = seenOccurrences.get( itemKey ) ?? 0;
		seenOccurrences.set( itemKey, occurrence + 1 );
		return snapshots[ occurrence ] ?? item;
	} );
}

function restoreThreadNode(
	node: MastodonThreadNode,
	itemSnapshots: Map< string, MastodonFeedItem[] >,
	seenOccurrences: Map< string, number >
): MastodonThreadNode {
	if ( node.type !== 'post' ) {
		return node;
	}

	const post = restoreFeedItems( [ node.post ], itemSnapshots, seenOccurrences )[ 0 ];
	const parent = node.parent
		? restoreThreadNode( node.parent, itemSnapshots, seenOccurrences )
		: null;
	const replies = node.replies.map( ( reply ) =>
		restoreThreadNode( reply, itemSnapshots, seenOccurrences )
	);

	if (
		post === node.post &&
		parent === node.parent &&
		replies.every( ( reply, idx ) => reply === node.replies[ idx ] )
	) {
		return node;
	}

	return { ...node, post, parent, replies };
}

function restoreMastodonQueryData(
	data: unknown,
	items: OptimisticContext[ 'snapshots' ][ number ][ 'items' ]
): unknown {
	const itemSnapshots = new Map< string, MastodonFeedItem[] >();
	for ( const { itemKey, occurrence, item } of items ) {
		const snapshots = itemSnapshots.get( itemKey ) ?? [];
		snapshots[ occurrence ] = item;
		itemSnapshots.set( itemKey, snapshots );
	}
	const seenOccurrences = new Map< string, number >();

	if ( isInfiniteFeedData( data ) ) {
		return {
			...data,
			pages: data.pages.map( ( page ) =>
				Array.isArray( page.items )
					? {
							...page,
							items: restoreFeedItems( page.items, itemSnapshots, seenOccurrences ),
					  }
					: page
			),
		};
	}

	if ( isObject( data ) && isObject( data.thread ) ) {
		return {
			...data,
			thread: restoreThreadNode(
				data.thread as unknown as MastodonThreadNode,
				itemSnapshots,
				seenOccurrences
			),
		};
	}

	return data;
}

function restoreMastodonPostSnapshots(
	queryClient: QueryClient,
	ctx: OptimisticContext | undefined
) {
	if ( ! ctx ) {
		return;
	}
	for ( const { key, items } of ctx.snapshots ) {
		if ( ! items.length ) {
			continue;
		}
		const current = queryClient.getQueryData( key );
		if ( ! current ) {
			// Cache entry was evicted between onMutate and onError (e.g. via
			// gcTime or an explicit removeQueries). Nothing to roll back —
			// the next refetch will reload from the server.
			continue;
		}
		queryClient.setQueryData( key, restoreMastodonQueryData( current, items ) );
	}
}

export function useCreateMastodonLikeMutation( connectionId: number ) {
	const queryClient = useQueryClient();
	return useMutation< void, MastodonError, { statusId: string }, OptimisticContext >( {
		mutationFn: ( { statusId } ) => createMastodonLike( { connectionId, statusId } ),
		onMutate: async ( { statusId } ) => {
			// cancelQueries is best-effort — TanStack docs flag it as such.
			// If it rejects (rare; route-change teardown races) we want to
			// continue with the optimistic patch and the actual mutation
			// rather than treat the whole call as failed before it starts.
			try {
				await cancelMastodonQueriesForConnection( queryClient, connectionId );
			} catch {
				// Swallow; the optimistic patch below + mutationFn must
				// still run. Snapshot rollback on real onError is unaffected.
			}
			return patchMastodonPostCaches( queryClient, connectionId, statusId, ( item ) => ( {
				...item,
				viewer: {
					...( item.viewer ?? { favourited: false, reblogged: false } ),
					favourited: true,
				},
				counts: { ...item.counts, favourites: item.counts.favourites + 1 },
			} ) );
		},
		onError: ( _err, _vars, ctx ) => restoreMastodonPostSnapshots( queryClient, ctx ),
		// No onSuccess re-patch — the boolean is already correct from onMutate.
	} );
}

export function useDeleteMastodonLikeMutation( connectionId: number ) {
	const queryClient = useQueryClient();
	return useMutation< void, MastodonError, { statusId: string }, OptimisticContext >( {
		mutationFn: ( { statusId } ) => deleteMastodonLike( { connectionId, statusId } ),
		onMutate: async ( { statusId } ) => {
			try {
				await cancelMastodonQueriesForConnection( queryClient, connectionId );
			} catch {
				// See useCreateMastodonLikeMutation for rationale.
			}
			return patchMastodonPostCaches( queryClient, connectionId, statusId, ( item ) => ( {
				...item,
				viewer: {
					...( item.viewer ?? { favourited: false, reblogged: false } ),
					favourited: false,
				},
				counts: {
					...item.counts,
					favourites: Math.max( 0, item.counts.favourites - 1 ),
				},
			} ) );
		},
		onError: ( _err, _vars, ctx ) => restoreMastodonPostSnapshots( queryClient, ctx ),
	} );
}

export function useCreateMastodonRepostMutation( connectionId: number ) {
	const queryClient = useQueryClient();
	return useMutation< void, MastodonError, { statusId: string }, OptimisticContext >( {
		mutationFn: ( { statusId } ) => createMastodonRepost( { connectionId, statusId } ),
		onMutate: async ( { statusId } ) => {
			try {
				await cancelMastodonQueriesForConnection( queryClient, connectionId );
			} catch {
				// See useCreateMastodonLikeMutation for rationale.
			}
			return patchMastodonPostCaches( queryClient, connectionId, statusId, ( item ) => ( {
				...item,
				viewer: {
					...( item.viewer ?? { favourited: false, reblogged: false } ),
					reblogged: true,
				},
				counts: { ...item.counts, boosts: item.counts.boosts + 1 },
			} ) );
		},
		onError: ( _err, _vars, ctx ) => restoreMastodonPostSnapshots( queryClient, ctx ),
		// No onSuccess re-patch — boolean already correct from onMutate.
	} );
}

export function useDeleteMastodonRepostMutation( connectionId: number ) {
	const queryClient = useQueryClient();
	return useMutation< void, MastodonError, { statusId: string }, OptimisticContext >( {
		mutationFn: ( { statusId } ) => deleteMastodonRepost( { connectionId, statusId } ),
		onMutate: async ( { statusId } ) => {
			try {
				await cancelMastodonQueriesForConnection( queryClient, connectionId );
			} catch {
				// See useCreateMastodonLikeMutation for rationale.
			}
			return patchMastodonPostCaches( queryClient, connectionId, statusId, ( item ) => ( {
				...item,
				viewer: {
					...( item.viewer ?? { favourited: false, reblogged: false } ),
					reblogged: false,
				},
				counts: {
					...item.counts,
					boosts: Math.max( 0, item.counts.boosts - 1 ),
				},
			} ) );
		},
		onError: ( _err, _vars, ctx ) => restoreMastodonPostSnapshots( queryClient, ctx ),
	} );
}

interface CreatePostContext {
	parentCountsContext?: OptimisticContext;
}

/**
 * Wire-layer factory for creating a Mastodon status (reply or standalone post).
 *
 * Reply mode (`in_reply_to_id` set): bumps `counts.replies` on the parent post
 * across every Mastodon cache (timeline / thread / profile-feed / tag-feed)
 * via `patchMastodonPostCaches`, snapshotting each patched item so `onError`
 * can restore atomically.
 *
 * Standalone mode (no `in_reply_to_id`): no cache patch yet — the modal still
 * relies on the `onSuccess` invalidate to surface the new post. Standalone
 * optimistic prepend wires up in slice 8.
 *
 * Accepts the consumer's QueryClient because Calypso boots its own separate
 * from the singleton in `@automattic/api-queries`. See
 * `client/reader/AGENTS.md` for the rationale.
 */
export const createMastodonPostMutation = ( queryClient: QueryClient ) =>
	mutationOptions<
		MastodonCreatePostResult,
		MastodonError,
		MastodonCreatePostParams,
		CreatePostContext
	>( {
		mutationFn: createMastodonPost,
		onMutate: async ( vars ) => {
			// cancelQueries is best-effort — TanStack docs flag it as such.
			// If it rejects (rare; route-change teardown races) we want to
			// continue with the optimistic patch and the actual mutation
			// rather than treat the whole call as failed before it starts.
			try {
				await cancelMastodonQueriesForConnection( queryClient, vars.connectionId );
			} catch {
				// Swallow; the optimistic patch below + mutationFn must
				// still run. Snapshot rollback on real onError is unaffected.
			}

			const ctx: CreatePostContext = {};

			if ( vars.in_reply_to_id ) {
				// Reply mode: bump counts.replies on the parent post in every
				// cached page where it appears. The snapshots returned by
				// patchMastodonPostCaches feed restoreMastodonPostSnapshots in
				// onError.
				ctx.parentCountsContext = patchMastodonPostCaches(
					queryClient,
					vars.connectionId,
					vars.in_reply_to_id,
					( item ) => ( {
						...item,
						counts: { ...item.counts, replies: item.counts.replies + 1 },
					} )
				);
				return ctx;
			}

			// Standalone optimistic prepend wires up in slice 8.
			return ctx;
		},
		onError: ( _err, _vars, ctx ) => {
			if ( ! ctx ) {
				return;
			}
			restoreMastodonPostSnapshots( queryClient, ctx.parentCountsContext );
		},
		onSuccess: ( _result, vars ) => {
			// Invalidate the timeline so the new post (top-level or reply)
			// re-materialises from the server on next read.
			queryClient.invalidateQueries( {
				queryKey: readerMastodonKeys.timeline( vars.connectionId ),
			} );
			// Reply mode: also invalidate the parent's thread cache so the
			// newly-created reply appears on the next thread read instead of
			// waiting out the 30s staleTime. The optimistic patch in onMutate
			// only bumped `counts.replies`; without this invalidate, replying
			// from the thread surface looks broken until the user navigates
			// away and back.
			if ( vars.in_reply_to_id ) {
				queryClient.invalidateQueries( {
					queryKey: readerMastodonKeys.thread( vars.connectionId, vars.in_reply_to_id ),
				} );
			}
		},
	} );
