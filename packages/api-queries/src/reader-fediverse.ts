import {
	createFediverseFollow,
	createFediversePost,
	deleteFediverseFollow,
	getFediverseActorFollowers,
	getFediverseActorFollowing,
	getFediverseAuthorFeed,
	getFediverseAuthorProfile,
	getFediverseConnection,
	getFediverseConnections,
	getFediverseNotifications,
	getFediverseTimeline,
	mapNotificationsFilter,
	PENDING_FEDIVERSE_POST_URI,
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
	FediverseCreatePostParams,
	FediverseCreatePostResult,
	FediverseError,
	FediverseFeedItem,
	FediverseFollowResponse,
	FediverseNotificationsPage,
	FediverseTimelinePage,
	GetFediverseAuthorFeedParams,
	GetFediverseTimelineParams,
	NotificationsFilter,
} from '@automattic/api-core';

export const fediverseConnectionsQueryOptions = () =>
	queryOptions< FediverseConnectionsResponse, FediverseError >( {
		queryKey: readerFediverseKeys.connections(),
		queryFn: getFediverseConnections,
		// Same staleTime as the Mastodon connections query — connections
		// rarely change within a session and the list view re-mounts on
		// every back-from-account navigation.
		staleTime: 60_000,
		// Same transient-error retry posture as every other query in this
		// file. Without it a `rate_limited` 429 fails fast → `connection`
		// resolves to `null` → the composer's `blogDefault` collapses to
		// `'public'`, silently dropping the user's per-blog default.
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

export interface UseFediverseNotificationsOptions {
	filter?: NotificationsFilter;
}

export const fediverseNotificationsInfiniteQuery = (
	connectionId: number,
	filter: NotificationsFilter = 'all'
) =>
	infiniteQueryOptions<
		FediverseNotificationsPage,
		FediverseError,
		InfiniteData< FediverseNotificationsPage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerFediverseKeys.notifications( connectionId, filter ),
		queryFn: ( { pageParam } ) =>
			getFediverseNotifications( {
				connectionId,
				cursor: pageParam,
				types: mapNotificationsFilter( filter ),
			} ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage ) => lastPage.next_cursor ?? undefined,
		enabled: connectionId > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		// Same retry posture as the Fediverse timeline / author-profile queries:
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

export function useFediverseNotificationsInfiniteQuery(
	connectionId: number,
	options: UseFediverseNotificationsOptions = {}
) {
	const { filter = 'all' } = options;
	return useInfiniteQuery( fediverseNotificationsInfiniteQuery( connectionId, filter ) );
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
		meta: { statId: 'fediverse-actor-follow' },
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
		meta: { statId: 'fediverse-actor-unfollow' },
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

let pendingPostCounter = 0;
/**
 * Monotonic counter-stamped placeholder for an in-flight standalone post.
 * Each submit gets a unique suffix so back-to-back composes can be told
 * apart in the timeline cache. Mirrors atmosphere's `nextPendingPostUri`.
 */
export const nextPendingFediversePostUri = () =>
	`${ PENDING_FEDIVERSE_POST_URI }#${ ++pendingPostCounter }`;

export interface CreateFediversePostContext {
	/** Snapshot of every timeline-page cache entry touched by the optimistic patch. */
	snapshots: Array< {
		queryKey: QueryKey;
		data: InfiniteData< FediverseTimelinePage > | undefined;
	} >;
	/** Synthetic id stamped on the placeholder item; matched on success to splice in the server item. */
	pendingUri: string;
}

/**
 * Mutation factory for publishing a new ActivityPub post.
 * Optimistically prepends a placeholder `FediverseFeedItem` (stamped
 * with a `PENDING_FEDIVERSE_POST_URI` sentinel id) to every cached
 * timeline page for the connection so the composer's success feels
 * immediate; rolls back on error; on success splices the server item
 * over the placeholder and invalidates the timeline to refetch from the
 * canonical source.
 *
 * Accepts the consumer's QueryClient — Calypso boots its own
 * separate from the api-queries singleton. See `client/reader/AGENTS.md`.
 * Mirrors `createMastodonPostMutation` / `createPostMutation`.
 */
export const createFediversePostMutation = ( queryClient: QueryClient ) =>
	mutationOptions<
		FediverseCreatePostResult,
		FediverseError,
		FediverseCreatePostParams,
		CreateFediversePostContext
	>( {
		meta: { statId: 'fediverse-post-create' },
		mutationFn: createFediversePost,
		onMutate: async ( vars ) => {
			const timelineKey = readerFediverseKeys.timeline( vars.connectionId );
			try {
				await queryClient.cancelQueries( { queryKey: timelineKey } );
			} catch {
				// Best-effort per TanStack docs; the optimistic patch + mutationFn
				// must still run.
			}

			const pendingUri = nextPendingFediversePostUri();
			const snapshots: CreateFediversePostContext[ 'snapshots' ] = [];

			const matches = queryClient.getQueriesData< InfiniteData< FediverseTimelinePage > >( {
				queryKey: timelineKey,
			} );
			const connection = queryClient
				.getQueryData< FediverseConnectionsResponse >( readerFediverseKeys.connections() )
				?.connections.find( ( c ) => c.id === vars.connectionId );
			for ( const [ queryKey, data ] of matches ) {
				snapshots.push( { queryKey, data } );
				if ( ! data || data.pages.length === 0 ) {
					continue;
				}
				const placeholder = buildPlaceholderItem( vars, pendingUri, connection );
				const [ firstPage, ...rest ] = data.pages;
				const patchedFirst: FediverseTimelinePage = {
					...firstPage,
					items: [ placeholder, ...firstPage.items ],
				};
				queryClient.setQueryData< InfiniteData< FediverseTimelinePage > >( queryKey, {
					...data,
					pages: [ patchedFirst, ...rest ],
				} );
			}

			return { snapshots, pendingUri };
		},
		onError: ( _err, _vars, ctx ) => {
			if ( ! ctx ) {
				return;
			}
			for ( const { queryKey, data } of ctx.snapshots ) {
				queryClient.setQueryData( queryKey, data );
			}
		},
		onSuccess: ( result, vars, ctx ) => {
			// Replace placeholder with the server item in every snapshotted
			// page where the placeholder landed. Avoids a refetch flash for
			// the user while still letting `invalidateQueries` below reconcile
			// any drift on the next read.
			if ( ctx ) {
				const matches = queryClient.getQueriesData< InfiniteData< FediverseTimelinePage > >( {
					queryKey: readerFediverseKeys.timeline( vars.connectionId ),
				} );
				for ( const [ queryKey, data ] of matches ) {
					if ( ! data ) {
						continue;
					}
					queryClient.setQueryData< InfiniteData< FediverseTimelinePage > >( queryKey, {
						...data,
						pages: data.pages.map( ( page ) => ( {
							...page,
							items: page.items.map( ( item ) =>
								item.id === ctx.pendingUri ? result.post : item
							),
						} ) ),
					} );
				}
			}
			// Known limitation (CM-704): the AP `/timeline` endpoint returns
			// the home-stream inbox — posts from followed actors — and does
			// NOT include the caller's own published posts. This refetch
			// therefore wipes the just-published item from the cache, and
			// the user sees their post briefly appear (via the optimistic
			// patch) and then disappear once `invalidateQueries` resolves.
			// The post still appears on the Profile view (author-feed
			// endpoint) and on the published web URL. Tracked for a backend
			// follow-up that mirrors Mastodon's home-timeline-includes-own
			// semantics; until then, the invalidate is still correct
			// (cache should mirror server truth) but the UX is rough.
			queryClient.invalidateQueries( {
				queryKey: readerFediverseKeys.timeline( vars.connectionId ),
			} );
		},
	} );

/**
 * Build the synthetic feed item used during the optimistic-update window.
 * Borrows shape from `FediverseFeedItem` so the timeline renderer can
 * project it through the existing mapper without special-casing.
 *
 * When the connections cache is warm, the placeholder's `account` is
 * hydrated from the connection so the placeholder renders with the user's
 * real avatar / handle / display name instead of a blank chip while the
 * request is in flight. When cold, falls back to empty fields — the
 * `invalidateQueries` in `onSuccess` will surface the canonical author on
 * the refetch. Mirrors atmosphere's `authorFromConnection` shape.
 */
function buildPlaceholderItem(
	vars: FediverseCreatePostParams,
	pendingUri: string,
	connection: FediverseConnection | undefined
): FediverseFeedItem {
	return {
		id: pendingUri,
		url: '',
		created_at: new Date().toISOString(),
		account: accountFromConnection( connection ),
		content: vars.content,
		spoiler_text: vars.summary ?? '',
		sensitive: Boolean( vars.sensitive ),
		language: vars.language ?? null,
		in_reply_to_id: null,
		in_reply_to_account_id: null,
		boost: null,
		media: [],
		counts: { replies: 0, boosts: 0, favourites: 0 },
	};
}

function accountFromConnection(
	connection: FediverseConnection | undefined
): FediverseFeedItem[ 'account' ] {
	if ( ! connection ) {
		return { id: '', username: '', acct: '', display_name: '', avatar: null };
	}
	// `webfinger` is emitted with a leading `@` (`@user@host`); strip it so the
	// mapper's `qualifyAcct` doesn't double up to `@@user@host`.
	const handle = connection.webfinger.startsWith( '@' )
		? connection.webfinger.slice( 1 )
		: connection.webfinger;
	const username = handle.split( '@' )[ 0 ] ?? '';
	return {
		// For blog actors the blog URL is also the canonical AP actor URL.
		id: connection.url,
		username,
		acct: handle,
		display_name: connection.name,
		avatar: connection.icon || null,
	};
}
