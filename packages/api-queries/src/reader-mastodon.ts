import {
	authorizeMastodonConnection,
	completeMastodonConnection,
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
	queryOptions,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
	type InfiniteData,
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
	MastodonError,
	MastodonTagFilter,
	MastodonTagFeedPage,
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
