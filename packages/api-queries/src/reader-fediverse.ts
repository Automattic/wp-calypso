import {
	createFediverseFollow,
	deleteFediverseFollow,
	getFediverseActorFollowers,
	getFediverseActorFollowing,
	getFediverseAuthorFeed,
	getFediverseAuthorProfile,
	getFediverseConnection,
	getFediverseConnections,
	getFediverseTimeline,
	readerFediverseKeys,
} from '@automattic/api-core';
import {
	infiniteQueryOptions,
	mutationOptions,
	queryOptions,
	useInfiniteQuery,
	useQuery,
	type InfiniteData,
	type QueryClient,
	type QueryKey,
} from '@tanstack/react-query';
import type {
	FediverseAccountSummariesPage,
	FediverseAuthorFeedPage,
	FediverseAuthorProfile,
	FediverseConnection,
	FediverseConnectionsResponse,
	FediverseError,
	FediverseFollowResponse,
	FediverseTimelinePage,
	GetFediverseAuthorFeedParams,
	GetFediverseTimelineParams,
} from '@automattic/api-core';

export const fediverseConnectionsQueryOptions = () =>
	queryOptions< FediverseConnectionsResponse, FediverseError >( {
		queryKey: readerFediverseKeys.connections(),
		queryFn: getFediverseConnections,
		// Same staleTime as the Mastodon connections query — connections
		// rarely change within a session and the list view re-mounts on
		// every back-from-account navigation.
		staleTime: 60_000,
	} );

export function useFediverseConnectionsQuery( { enabled }: { enabled?: boolean } = {} ) {
	return useQuery( { ...fediverseConnectionsQueryOptions(), enabled } );
}

export const fediverseConnectionQueryOptions = ( id: number | null ) =>
	queryOptions< FediverseConnection, FediverseError >( {
		queryKey: readerFediverseKeys.connection( id ),
		queryFn: () => getFediverseConnection( id as number ),
		enabled: id !== null && id > 0,
		staleTime: 60_000,
	} );

export function useFediverseConnectionQuery( id: number | null ) {
	return useQuery( fediverseConnectionQueryOptions( id ) );
}

export const fediverseTimelineInfiniteQuery = ( connectionId: number ) =>
	infiniteQueryOptions<
		FediverseTimelinePage,
		FediverseError,
		InfiniteData< FediverseTimelinePage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerFediverseKeys.timeline( connectionId ),
		queryFn: ( { pageParam } ) =>
			getFediverseTimeline( {
				connectionId,
				cursor: pageParam,
			} as GetFediverseTimelineParams ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage ) => lastPage.cursor ?? undefined,
		enabled: connectionId > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		// Same retry posture as the Mastodon timeline / thread queries:
		// terminal errors fail fast; transient errors (rate_limited,
		// upstream_unavailable) retry once with retry_after-aware backoff.
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

export function useFediverseTimelineInfiniteQuery( connectionId: number ) {
	return useInfiniteQuery( fediverseTimelineInfiniteQuery( connectionId ) );
}

// Normalise an actor string for cache keying.
//
// Webfinger handles (`alice@example.com`, `@alice@example.com`,
// `@Alice@EXAMPLE.com`) dedupe to the same key — trim, drop a leading
// `@`, lowercase. URL-shaped actors (the backend also accepts canonical
// AP actor URLs like `https://example.com/Users/Alice`) are
// case-sensitive on the path segment, so lowercasing would point at a
// different actor on case-sensitive servers; URLs are returned trimmed
// only.
export function normalizeFediverseActor( actor: string ): string {
	const trimmed = actor.trim();
	if ( /^https?:\/\//i.test( trimmed ) ) {
		return trimmed;
	}
	const stripped = trimmed.startsWith( '@' ) ? trimmed.slice( 1 ) : trimmed;
	return stripped.toLowerCase();
}

// Internal alias preserved so the local query factories below stay readable.
const normalizeActor = normalizeFediverseActor;

export const fediverseAuthorProfileQueryOptions = ( connectionId: number, actor: string ) => {
	const normalized = normalizeActor( actor );
	return queryOptions< FediverseAuthorProfile, FediverseError >( {
		queryKey: readerFediverseKeys.authorProfile( connectionId, normalized ),
		queryFn: () => getFediverseAuthorProfile( { connectionId, actor: normalized } ),
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

export function useFediverseAuthorProfileQuery( connectionId: number, actor: string ) {
	return useQuery( fediverseAuthorProfileQueryOptions( connectionId, actor ) );
}

export const fediverseAuthorFeedInfiniteQuery = ( connectionId: number, actor: string ) => {
	const normalized = normalizeActor( actor );
	return infiniteQueryOptions<
		FediverseAuthorFeedPage,
		FediverseError,
		InfiniteData< FediverseAuthorFeedPage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerFediverseKeys.authorFeed( connectionId, normalized ),
		queryFn: ( { pageParam } ) =>
			getFediverseAuthorFeed( {
				connectionId,
				actor: normalized,
				cursor: pageParam,
			} as GetFediverseAuthorFeedParams ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage ) => lastPage.cursor ?? undefined,
		enabled: connectionId > 0 && normalized.length > 0,
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

export function useFediverseAuthorFeedInfiniteQuery( connectionId: number, actor: string ) {
	return useInfiniteQuery( fediverseAuthorFeedInfiniteQuery( connectionId, actor ) );
}

export interface FediverseActorPageQueryParams {
	connectionId: number;
	actor: string;
}

export const fediverseActorFollowersInfiniteQuery = ( params: FediverseActorPageQueryParams ) => {
	const normalizedActor = normalizeActor( params.actor );
	return infiniteQueryOptions<
		FediverseAccountSummariesPage,
		FediverseError,
		InfiniteData< FediverseAccountSummariesPage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerFediverseKeys.actorFollowers( params.connectionId, normalizedActor ),
		queryFn: ( { pageParam } ) =>
			getFediverseActorFollowers( {
				connectionId: params.connectionId,
				actor: normalizedActor,
				cursor: pageParam,
			} ),
		initialPageParam: undefined,
		// `|| undefined` (not `??`): an empty-string cursor terminates pagination,
		// matching the Mastodon followers/following hardening.
		getNextPageParam: ( lastPage ) => lastPage.cursor || undefined,
		enabled: params.connectionId > 0 && normalizedActor.length > 0,
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

export function useFediverseActorFollowersInfiniteQuery( params: FediverseActorPageQueryParams ) {
	return useInfiniteQuery( fediverseActorFollowersInfiniteQuery( params ) );
}

export const fediverseActorFollowingInfiniteQuery = ( params: FediverseActorPageQueryParams ) => {
	const normalizedActor = normalizeActor( params.actor );
	return infiniteQueryOptions<
		FediverseAccountSummariesPage,
		FediverseError,
		InfiniteData< FediverseAccountSummariesPage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerFediverseKeys.actorFollowing( params.connectionId, normalizedActor ),
		queryFn: ( { pageParam } ) =>
			getFediverseActorFollowing( {
				connectionId: params.connectionId,
				actor: normalizedActor,
				cursor: pageParam,
			} ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage ) => lastPage.cursor || undefined,
		enabled: params.connectionId > 0 && normalizedActor.length > 0,
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

export function useFediverseActorFollowingInfiniteQuery( params: FediverseActorPageQueryParams ) {
	return useInfiniteQuery( fediverseActorFollowingInfiniteQuery( params ) );
}

export interface FollowFediverseActorVars {
	connectionId: number;
	/**
	 * Cache-key actor — the same value the scoped profile query is keyed on.
	 * Used to locate the cache entry to patch. Normalised internally.
	 */
	actor: string;
	/**
	 * Whether the target account is locked. Drives the optimistic patch:
	 * locked accounts transition to `requested: true` (pending approval),
	 * unlocked accounts go straight to `following: true`. Optional so
	 * callers who don't yet have `locked` in scope still get the unlocked
	 * default.
	 */
	locked?: boolean;
}

export interface FollowFediverseMutationContext {
	previous: FediverseAuthorProfile | undefined;
}

const fediverseAuthorProfileKey = ( vars: { connectionId: number; actor: string } ) =>
	readerFediverseKeys.authorProfile( vars.connectionId, normalizeActor( vars.actor ) );

/**
 * Mutation factory for following a Fediverse actor. Optimistically marks
 * the cached scoped-profile entry's viewer as following + clears any
 * pending request flag. The real server-side state (which may be
 * `requested: true` for locked accounts) is committed in `onSuccess`.
 *
 * **List-row invariant**: this factory only writes to the
 * `authorProfile` cache key. Callers that render followers / following
 * list rows (each with their own `viewer` state) must invalidate the
 * relevant `actorFollowers` / `actorFollowing` query in their own
 * `onSuccess` so the row mirrors server truth. Without that, the row
 * keeps the pre-click state until `staleTime` expires. The followers /
 * following views both follow this contract; mirrors the Mastodon
 * pattern in `client/reader/mastodon/{followers,following}-view.tsx`.
 *
 * Accepts the consumer's QueryClient because Calypso boots its own
 * separate from the singleton in `@automattic/api-queries`. See
 * `client/reader/AGENTS.md` for the rationale. Mirrors
 * `followMastodonActorMutation`.
 */
export const followFediverseActorMutation = ( queryClient: QueryClient ) =>
	mutationOptions<
		FediverseFollowResponse,
		FediverseError,
		FollowFediverseActorVars,
		FollowFediverseMutationContext
	>( {
		mutationFn: ( vars ) =>
			createFediverseFollow( { connectionId: vars.connectionId, actor: vars.actor } ),
		onMutate: async ( vars ) => {
			const key = fediverseAuthorProfileKey( vars );
			try {
				await queryClient.cancelQueries( { queryKey: key } );
			} catch {
				// Best-effort per TanStack docs; if cancel fails the optimistic
				// patch + mutationFn must still run.
			}
			const previous = queryClient.getQueryData< FediverseAuthorProfile >( key );
			// Locked accounts go to `requested: true` (pending approval); unlocked
			// accounts transition straight to `following: true`. Falling back to
			// `old.locked` keeps callers who don't yet thread `vars.locked` working.
			const isLocked = vars.locked ?? previous?.locked ?? false;
			queryClient.setQueryData< FediverseAuthorProfile >( key, ( old ) =>
				old && old.viewer
					? {
							...old,
							viewer: {
								...old.viewer,
								following: isLocked ? false : true,
								requested: isLocked ? true : false,
							},
					  }
					: old
			);
			return { previous };
		},
		onError: ( _err, vars, context ) => {
			const key = fediverseAuthorProfileKey( vars );
			if ( context?.previous ) {
				queryClient.setQueryData( key, context.previous );
				return;
			}
			// No snapshot to roll back to; refetch so the optimistic patch can't
			// outlive the failure as a stale cache value.
			return queryClient.invalidateQueries( { queryKey: key } );
		},
		onSuccess: ( data, vars ) => {
			const key = fediverseAuthorProfileKey( vars );
			const updated = queryClient.setQueryData< FediverseAuthorProfile >( key, ( old ) =>
				old
					? {
							...old,
							viewer: data.viewer,
					  }
					: old
			);
			if ( ! updated ) {
				// `setQueryData` returns undefined when the cache entry was
				// absent at update time (evicted mid-flight, or never
				// populated). Refetch so the authoritative server `viewer` —
				// which carries `requested: true` for locked accounts — isn't
				// lost.
				return queryClient.invalidateQueries( { queryKey: key } );
			}
		},
	} );

/**
 * Mutation factory for unfollowing a Fediverse actor. Also cancels a
 * pending follow request (locked accounts) — the unfollow endpoint
 * covers both. Optimistically clears `viewer.following` and
 * `viewer.requested`; rolls back on error. Mirrors
 * `unfollowMastodonActorMutation`.
 *
 * Same `authorProfile`-cache list-row invariant as
 * `followFediverseActorMutation`: callers rendering list rows must
 * invalidate the relevant `actorFollowers` / `actorFollowing` query in
 * their own `onSuccess`.
 */
export const unfollowFediverseActorMutation = ( queryClient: QueryClient ) =>
	mutationOptions<
		FediverseFollowResponse,
		FediverseError,
		FollowFediverseActorVars,
		FollowFediverseMutationContext
	>( {
		mutationFn: ( vars ) =>
			deleteFediverseFollow( { connectionId: vars.connectionId, actor: vars.actor } ),
		onMutate: async ( vars ) => {
			const key = fediverseAuthorProfileKey( vars );
			try {
				await queryClient.cancelQueries( { queryKey: key } );
			} catch {
				// Best-effort per TanStack docs; same rationale as the follow path.
			}
			const previous = queryClient.getQueryData< FediverseAuthorProfile >( key );
			queryClient.setQueryData< FediverseAuthorProfile >( key, ( old ) =>
				old && old.viewer
					? {
							...old,
							viewer: {
								...old.viewer,
								following: false,
								requested: false,
							},
					  }
					: old
			);
			return { previous };
		},
		onError: ( _err, vars, context ) => {
			const key = fediverseAuthorProfileKey( vars );
			if ( context?.previous ) {
				queryClient.setQueryData( key, context.previous );
				return;
			}
			return queryClient.invalidateQueries( { queryKey: key } );
		},
		onSuccess: ( data, vars ) => {
			const key = fediverseAuthorProfileKey( vars );
			const updated = queryClient.setQueryData< FediverseAuthorProfile >( key, ( old ) =>
				old
					? {
							...old,
							viewer: data.viewer,
					  }
					: old
			);
			if ( ! updated ) {
				return queryClient.invalidateQueries( { queryKey: key } );
			}
		},
	} );
