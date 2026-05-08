import {
	createConnection,
	createFollow,
	createLike,
	createPost,
	createRepost,
	deleteFollow,
	deleteLike,
	deletePost,
	deleteRepost,
	getAtmosphereActorFollowers,
	getAtmosphereActorFollows,
	getAtmosphereTagFeed,
	getAuthorFeed,
	getAuthorProfile,
	getConnection,
	getConnections,
	getScopedAuthorFeed,
	getScopedProfile,
	getScopedThread,
	getThread,
	getTimeline,
	PENDING_LIKE_URI,
	PENDING_POST_URI,
	PENDING_REPLY_URI,
	PENDING_REPOST_URI,
	isValidHashtag,
	readerAtmosphereKeys,
	uploadBlob,
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
	AtmosphereAuthor,
	AtmosphereAuthorFeedFilter,
	AtmosphereAuthorFeedPage,
	AtmosphereAuthorProfile,
	AtmosphereConnectionDetails,
	AtmosphereConnectionsResponse,
	AtmosphereCreateConnectionResponse,
	AtmosphereCreateFollowResponse,
	AtmosphereEmbed,
	AtmosphereError,
	AtmosphereFeedItem,
	AtmosphereScopedProfile,
	AtmosphereScopedProfilesPage,
	AtmosphereTagFeedPage,
	AtmosphereThreadResponse,
	AtmosphereThreadNode,
	AtmosphereTimelinePage,
	CreateConnectionParams,
	CreateLikeResult,
	CreatePostParams,
	CreatePostResult,
	CreateRepostResult,
	UploadBlobParams,
	UploadBlobResult,
} from '@automattic/api-core';

const TERMINAL_ERROR_KINDS: ReadonlySet< AtmosphereError[ 'kind' ] > = new Set( [
	'auth_required',
	'auth_failed',
	'invalid_handle',
	'invalid_credentials',
	'connection_not_found',
	'not_found',
	'bad_request',
	// rate_limited surfaces a wait-then-Retry UI; auto-retrying immediately
	// would contradict the user-facing message.
	'rate_limited',
	// Slice 7c POST /posts wire codes — all client-actionable, none transient.
	// Auto-retrying any of these would either repeat a guaranteed-fail call or
	// contradict the user-facing copy.
	'text_too_long',
	'reply_disabled',
	'quote_disabled',
	'target_unavailable',
] );

const isTerminalError = ( error: AtmosphereError ): boolean =>
	TERMINAL_ERROR_KINDS.has( error.kind );

export const connectionsQueryOptions = () =>
	queryOptions< AtmosphereConnectionsResponse, AtmosphereError >( {
		queryKey: readerAtmosphereKeys.connections(),
		queryFn: getConnections,
		staleTime: 60_000,
		retry: ( failureCount, error ) => {
			if ( isTerminalError( error ) ) {
				return false;
			}
			return failureCount < 2;
		},
	} );

export function useConnectionsQuery( { enabled }: { enabled?: boolean } = {} ) {
	return useQuery( { ...connectionsQueryOptions(), enabled } );
}

export function useCreateConnectionMutation() {
	const client = useQueryClient();
	return useMutation< AtmosphereCreateConnectionResponse, AtmosphereError, CreateConnectionParams >(
		{
			mutationFn: createConnection,
			onSuccess: () => {
				client.invalidateQueries( { queryKey: readerAtmosphereKeys.connections() } );
			},
		}
	);
}

export const connectionQueryOptions = ( id: number | null ) =>
	queryOptions< AtmosphereConnectionDetails, AtmosphereError >( {
		queryKey: readerAtmosphereKeys.connection( id ),
		queryFn: () => {
			if ( id === null || id <= 0 ) {
				// Defensive guard — `enabled` below should prevent this from
				// ever running. Throw the error type the query is typed for.
				const err: AtmosphereError = {
					kind: 'unknown',
					cause: new Error( `getConnection called with invalid id: ${ id }` ),
				};
				throw err;
			}
			return getConnection( id );
		},
		enabled: id !== null && id > 0,
		staleTime: 60_000,
	} );

export function useConnectionQuery( id: number | null ) {
	return useQuery( connectionQueryOptions( id ) );
}

export const timelineInfiniteQuery = ( connectionId: number ) =>
	infiniteQueryOptions<
		AtmosphereTimelinePage,
		AtmosphereError,
		InfiniteData< AtmosphereTimelinePage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerAtmosphereKeys.timeline( connectionId ),
		queryFn: ( { pageParam } ) => getTimeline( { connectionId, cursor: pageParam } ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage ) => lastPage.cursor || undefined,
		enabled: connectionId > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
	} );

export function useTimelineInfiniteQuery( connectionId: number ) {
	return useInfiniteQuery( timelineInfiniteQuery( connectionId ) );
}

export const threadQueryOptions = ( uri: string ) =>
	queryOptions< AtmosphereThreadResponse, AtmosphereError >( {
		queryKey: readerAtmosphereKeys.thread( uri ),
		queryFn: () => getThread( { uri } ),
		enabled: uri.length > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		retry: ( failureCount, error ) => {
			if ( isTerminalError( error ) ) {
				return false;
			}
			return failureCount < 2;
		},
	} );

export interface UseThreadQueryParams {
	uri: string;
}

export function useThreadQuery( { uri }: UseThreadQueryParams ) {
	return useQuery( threadQueryOptions( uri ) );
}

export interface AtmosphereScopedThreadQueryParams {
	connectionId: number;
	uri: string;
}

export const atmosphereScopedThreadQuery = ( params: AtmosphereScopedThreadQueryParams ) =>
	queryOptions< AtmosphereThreadResponse, AtmosphereError >( {
		queryKey: readerAtmosphereKeys.scopedThread( params.connectionId, params.uri ),
		queryFn: () => getScopedThread( params ),
		enabled: params.uri.length > 0 && params.connectionId > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		// Match threadQueryOptions' policy: bail immediately on terminal errors
		// (auth, 404, rate-limit, …) so the EmptyContent surfaces fast, but
		// retry transient failures twice before showing the error UI.
		retry: ( failureCount, error ) => {
			if ( isTerminalError( error ) ) {
				return false;
			}
			return failureCount < 2;
		},
	} );

export function useAtmosphereScopedThreadQuery( params: AtmosphereScopedThreadQueryParams ) {
	return useQuery( atmosphereScopedThreadQuery( params ) );
}

export const profileQueryOptions = ( actor: string ) =>
	queryOptions< AtmosphereAuthorProfile, AtmosphereError >( {
		queryKey: readerAtmosphereKeys.profile( actor ),
		queryFn: () => getAuthorProfile( { actor } ),
		enabled: actor.length > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
	} );

export interface UseAuthorProfileQueryParams {
	actor: string;
}

export function useAuthorProfileQuery( { actor }: UseAuthorProfileQueryParams ) {
	return useQuery( profileQueryOptions( actor ) );
}

export interface AtmosphereScopedProfileQueryParams {
	connectionId: number;
	actor: string;
}

export const atmosphereScopedProfileQuery = ( params: AtmosphereScopedProfileQueryParams ) =>
	queryOptions< AtmosphereScopedProfile, AtmosphereError >( {
		queryKey: readerAtmosphereKeys.scopedProfile( params.connectionId, params.actor ),
		queryFn: () => getScopedProfile( params ),
		enabled: params.actor.length > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		// Match threadQueryOptions' policy: bail immediately on terminal errors
		// (auth, 404, rate-limit, …) so the EmptyContent surfaces fast, but
		// retry transient failures twice before showing the error UI.
		retry: ( failureCount, error ) => {
			if ( isTerminalError( error ) ) {
				return false;
			}
			return failureCount < 2;
		},
	} );

export function useAtmosphereScopedProfileQuery( params: AtmosphereScopedProfileQueryParams ) {
	return useQuery( atmosphereScopedProfileQuery( params ) );
}

export const authorFeedInfiniteQuery = ( actor: string, filter?: AtmosphereAuthorFeedFilter ) => {
	// Collapse the default filter to undefined so the cache key and request
	// URL stay clean for the default tab. Callers can pass 'posts_no_replies'
	// without paying a cache-key change versus passing nothing at all —
	// matters for slice-6 cache compatibility. Centralized here (not in the
	// hook) so any direct factory caller gets the same behavior.
	const normalizedFilter = filter === 'posts_no_replies' ? undefined : filter;
	return infiniteQueryOptions<
		AtmosphereAuthorFeedPage,
		AtmosphereError,
		InfiniteData< AtmosphereAuthorFeedPage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerAtmosphereKeys.authorFeed( actor, normalizedFilter ),
		queryFn: ( { pageParam } ) =>
			getAuthorFeed( { actor, cursor: pageParam, filter: normalizedFilter } ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage ) => lastPage.cursor || undefined,
		enabled: actor.length > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
	} );
};

export interface UseAuthorFeedInfiniteQueryParams {
	actor: string;
	filter?: AtmosphereAuthorFeedFilter;
}

export function useAuthorFeedInfiniteQuery( { actor, filter }: UseAuthorFeedInfiniteQueryParams ) {
	return useInfiniteQuery( authorFeedInfiniteQuery( actor, filter ) );
}

export interface AtmosphereScopedAuthorFeedInfiniteQueryParams {
	connectionId: number;
	actor: string;
	filter?: AtmosphereAuthorFeedFilter;
}

export const atmosphereScopedAuthorFeedInfiniteQuery = (
	params: AtmosphereScopedAuthorFeedInfiniteQueryParams
) => {
	// Mirror authorFeedInfiniteQuery: collapse the default filter to undefined
	// so the cache key and request URL stay clean for the default tab.
	const normalizedFilter = params.filter === 'posts_no_replies' ? undefined : params.filter;
	return infiniteQueryOptions<
		AtmosphereAuthorFeedPage,
		AtmosphereError,
		InfiniteData< AtmosphereAuthorFeedPage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerAtmosphereKeys.scopedAuthorFeed(
			params.connectionId,
			params.actor,
			normalizedFilter
		),
		queryFn: ( { pageParam } ) =>
			getScopedAuthorFeed( {
				connectionId: params.connectionId,
				actor: params.actor,
				cursor: pageParam,
				filter: normalizedFilter,
			} ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage ) => lastPage.cursor || undefined,
		enabled: params.actor.length > 0 && params.connectionId > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		// Match threadQueryOptions' policy: bail immediately on terminal errors
		// (auth, 404, rate-limit, …) so the EmptyContent surfaces fast, but
		// retry transient failures twice before showing the error UI.
		retry: ( failureCount, error ) => {
			if ( isTerminalError( error ) ) {
				return false;
			}
			return failureCount < 2;
		},
	} );
};

export function useAtmosphereScopedAuthorFeedInfiniteQuery(
	params: AtmosphereScopedAuthorFeedInfiniteQueryParams
) {
	return useInfiniteQuery( atmosphereScopedAuthorFeedInfiniteQuery( params ) );
}

export interface AtmosphereActorPageQueryParams {
	connectionId: number;
	actor: string;
}

export const atmosphereActorFollowersInfiniteQuery = ( params: AtmosphereActorPageQueryParams ) =>
	infiniteQueryOptions<
		AtmosphereScopedProfilesPage,
		AtmosphereError,
		InfiniteData< AtmosphereScopedProfilesPage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerAtmosphereKeys.actorFollowers( params.connectionId, params.actor ),
		queryFn: ( { pageParam } ) =>
			getAtmosphereActorFollowers( {
				connectionId: params.connectionId,
				actor: params.actor,
				cursor: pageParam,
			} ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage ) => lastPage.cursor || undefined,
		enabled: params.connectionId > 0 && params.actor.length > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
	} );

export function useAtmosphereActorFollowersInfiniteQuery( params: AtmosphereActorPageQueryParams ) {
	return useInfiniteQuery( atmosphereActorFollowersInfiniteQuery( params ) );
}

export const atmosphereActorFollowsInfiniteQuery = ( params: AtmosphereActorPageQueryParams ) =>
	infiniteQueryOptions<
		AtmosphereScopedProfilesPage,
		AtmosphereError,
		InfiniteData< AtmosphereScopedProfilesPage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerAtmosphereKeys.actorFollows( params.connectionId, params.actor ),
		queryFn: ( { pageParam } ) =>
			getAtmosphereActorFollows( {
				connectionId: params.connectionId,
				actor: params.actor,
				cursor: pageParam,
			} ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage ) => lastPage.cursor || undefined,
		enabled: params.connectionId > 0 && params.actor.length > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
	} );

export function useAtmosphereActorFollowsInfiniteQuery( params: AtmosphereActorPageQueryParams ) {
	return useInfiniteQuery( atmosphereActorFollowsInfiniteQuery( params ) );
}

export interface FollowAtmosphereActorVars {
	connectionId: number;
	actor: string;
	subjectDid: string;
}

export interface FollowAtmosphereMutationContext {
	previous: AtmosphereScopedProfile | undefined;
	actorListSnapshots: ActorListRowSnapshot[];
}

const scopedProfileKey = ( vars: { connectionId: number; actor: string } ) =>
	atmosphereScopedProfileQuery( {
		connectionId: vars.connectionId,
		actor: vars.actor,
	} ).queryKey;

type ActorListInfiniteData = InfiniteData< AtmosphereScopedProfilesPage >;

/**
 * The viewer's `following` / `following_rkey` form a discriminated union
 * (both null = not following, both string = following). Modeling the patch
 * as a union — rather than two independent `string | null` fields — keeps
 * the discriminant intact when we spread it into the cached row's viewer.
 *
 * `'pending'` is the optimistic-state sentinel used by the follow flow
 * (matches `<FollowButton>`'s gating on `mutation.isPending`).
 */
type ActorListViewerPatch =
	| { following: null; following_rkey: null }
	| { following: string; following_rkey: string };

/**
 * Snapshot of an actor-list row's prior viewer state, captured by
 * `patchActorListsForSubject` so `onError` can roll back even when no
 * scoped-profile cache exists for the target subject. Each entry is
 * keyed by the cache it lives in plus an in-page coordinate tuple, and
 * carries `subjectDid` so the restore path can verify the row at that
 * coordinate is still the captured DID before overwriting (a concurrent
 * refetch landing between capture and restore could shift items).
 */
interface ActorListRowSnapshot {
	queryKey: QueryKey;
	subjectDid: string;
	pageIndex: number;
	itemIndex: number;
	viewer: AtmosphereScopedProfilesPage[ 'items' ][ number ][ 'viewer' ];
}

/**
 * Walk the open actor-followers / actor-follows infinite caches for the
 * given `connectionId` and patch the viewer state for any row whose DID
 * matches `subjectDid`. Returns a snapshot list so the caller can roll
 * back the patch on error.
 *
 * Scoping by `connectionId` matters: `viewer.following` is the caller's
 * follow URI, valid only on the connection that fetched the page. A
 * user with multiple ATmosphere connections must not see follow state
 * from one connection bleed into another's cached rows.
 *
 * Uses `setQueriesData` (plural, prefix matcher) so the patch applies
 * across every open list under the scoped prefix regardless of the
 * `actor` slot in the cache key.
 */
function patchActorListsForSubject(
	queryClient: QueryClient,
	connectionId: number,
	subjectDid: string,
	patch: ActorListViewerPatch
): ActorListRowSnapshot[] {
	const matchKeys = [
		[ ...readerAtmosphereKeys.all, 'actor-followers', connectionId ] as const,
		[ ...readerAtmosphereKeys.all, 'actor-follows', connectionId ] as const,
	];

	const snapshots: ActorListRowSnapshot[] = [];

	for ( const prefix of matchKeys ) {
		const matches = queryClient.getQueriesData< ActorListInfiniteData >( {
			queryKey: prefix as unknown as QueryKey,
		} );

		for ( const [ queryKey, data ] of matches ) {
			if ( ! data ) {
				continue;
			}
			let mutated = false;
			const pages = data.pages.map( ( page, pageIndex ) => {
				let pageMutated = false;
				const items = page.items.map( ( item, itemIndex ) => {
					if ( item.did !== subjectDid ) {
						return item;
					}
					snapshots.push( {
						queryKey,
						subjectDid,
						pageIndex,
						itemIndex,
						viewer: item.viewer,
					} );
					pageMutated = true;
					mutated = true;
					return {
						...item,
						viewer: {
							...item.viewer,
							...patch,
						},
					};
				} );
				return pageMutated ? { ...page, items } : page;
			} );
			if ( mutated ) {
				queryClient.setQueryData< ActorListInfiniteData >( queryKey, { ...data, pages } );
			}
		}
	}

	return snapshots;
}

/**
 * Restore a prior snapshot captured by `patchActorListsForSubject`. Used
 * by `onError` handlers to undo the optimistic write across all
 * actor-list caches without relying on a separately-loaded
 * scoped-profile cache.
 */
function restoreActorListSnapshots(
	queryClient: QueryClient,
	snapshots: ActorListRowSnapshot[]
): void {
	for ( const snapshot of snapshots ) {
		queryClient.setQueryData< ActorListInfiniteData >( snapshot.queryKey, ( old ) => {
			if ( ! old ) {
				return old;
			}
			const page = old.pages[ snapshot.pageIndex ];
			if ( ! page ) {
				return old;
			}
			const item = page.items[ snapshot.itemIndex ];
			// Verify the row at the captured coordinates is still the same
			// subject DID. A concurrent refetch landing between capture and
			// restore could shift items; without this check we'd overwrite
			// the wrong row's viewer state.
			if ( ! item || item.did !== snapshot.subjectDid ) {
				return old;
			}
			const items = page.items.slice();
			items[ snapshot.itemIndex ] = { ...item, viewer: snapshot.viewer };
			const pages = old.pages.slice();
			pages[ snapshot.pageIndex ] = { ...page, items };
			return { ...old, pages };
		} );
	}
}

/**
 * Best-effort cancel of all in-flight queries that the actor-list and
 * scoped-profile caches feed. TanStack documents `cancelQueries` as
 * best-effort; if it rejects (route-change teardown races) we still
 * want `onMutate` to write the optimistic patch and the mutationFn to
 * fire. Each cancel is independently caught so any non-cancel
 * exception (programmer error in the surrounding code) still surfaces.
 */
function cancelFollowMutationQueries(
	queryClient: QueryClient,
	connectionId: number,
	scopedKey: QueryKey
): Promise< void > {
	const swallow = () => undefined;
	return Promise.all( [
		queryClient.cancelQueries( { queryKey: scopedKey } ).catch( swallow ),
		queryClient
			.cancelQueries( {
				queryKey: [ ...readerAtmosphereKeys.all, 'actor-followers', connectionId ],
			} )
			.catch( swallow ),
		queryClient
			.cancelQueries( {
				queryKey: [ ...readerAtmosphereKeys.all, 'actor-follows', connectionId ],
			} )
			.catch( swallow ),
	] ).then( () => undefined );
}

/**
 * Mutation factory for creating an `app.bsky.graph.follow` record.
 * Optimistically marks the cached scoped-profile entry as following
 * (with placeholder rkey `'pending'`) in `onMutate`; writes the real
 * URI / rkey returned by the server in `onSuccess`; rolls back to the
 * prior cached value in `onError`. The `'pending'` placeholder is
 * never observed by `handleUnfollow` because <FollowButton> is
 * disabled while `followMut.isPending` is true.
 *
 * Accepts the consumer's QueryClient because Calypso boots its own
 * separate from the singleton in `@automattic/api-queries`. See
 * `client/reader/AGENTS.md` for the rationale.
 */
export const followAtmosphereActorMutation = ( queryClient: QueryClient ) =>
	mutationOptions<
		AtmosphereCreateFollowResponse,
		AtmosphereError,
		FollowAtmosphereActorVars,
		FollowAtmosphereMutationContext
	>( {
		mutationFn: ( vars ) =>
			createFollow( { connectionId: vars.connectionId, subject_did: vars.subjectDid } ),
		onMutate: async ( vars ) => {
			const key = scopedProfileKey( vars );
			await cancelFollowMutationQueries( queryClient, vars.connectionId, key );
			const previous = queryClient.getQueryData< AtmosphereScopedProfile >( key );
			queryClient.setQueryData< AtmosphereScopedProfile >( key, ( old ) =>
				old
					? {
							...old,
							viewer: {
								...old.viewer,
								following: 'pending',
								following_rkey: 'pending',
							},
					  }
					: old
			);
			const actorListSnapshots = patchActorListsForSubject(
				queryClient,
				vars.connectionId,
				vars.subjectDid,
				{
					following: 'pending',
					following_rkey: 'pending',
				}
			);
			return { previous, actorListSnapshots };
		},
		onError: ( _err, vars, context ) => {
			if ( context?.previous ) {
				queryClient.setQueryData( scopedProfileKey( vars ), context.previous );
			}
			if ( context?.actorListSnapshots?.length ) {
				restoreActorListSnapshots( queryClient, context.actorListSnapshots );
			}
		},
		onSuccess: ( data, vars ) => {
			queryClient.setQueryData< AtmosphereScopedProfile >( scopedProfileKey( vars ), ( old ) =>
				old
					? {
							...old,
							viewer: {
								...old.viewer,
								following: data.follow.uri,
								following_rkey: data.follow.rkey,
							},
					  }
					: old
			);
			patchActorListsForSubject( queryClient, vars.connectionId, vars.subjectDid, {
				following: data.follow.uri,
				following_rkey: data.follow.rkey,
			} );
		},
	} );

export interface UnfollowAtmosphereActorVars {
	connectionId: number;
	actor: string;
	rkey: string;
	subjectDid: string;
}

/**
 * Mutation factory for deleting an `app.bsky.graph.follow` record.
 * Optimistically clears the cached scoped-profile entry's
 * `viewer.following` / `viewer.following_rkey` to null in
 * `onMutate`; rolls back on error. There is no `onSuccess` cache
 * write because the optimistic state is already the success state
 * — a successful DELETE returns 204 with no body.
 *
 * Accepts the consumer's QueryClient because Calypso boots its own
 * separate from the singleton in `@automattic/api-queries`. See
 * `client/reader/AGENTS.md` for the rationale.
 */
export const unfollowAtmosphereActorMutation = ( queryClient: QueryClient ) =>
	mutationOptions<
		void,
		AtmosphereError,
		UnfollowAtmosphereActorVars,
		FollowAtmosphereMutationContext
	>( {
		mutationFn: ( vars ) => deleteFollow( { connectionId: vars.connectionId, rkey: vars.rkey } ),
		onMutate: async ( vars ) => {
			const key = scopedProfileKey( vars );
			await cancelFollowMutationQueries( queryClient, vars.connectionId, key );
			const previous = queryClient.getQueryData< AtmosphereScopedProfile >( key );
			queryClient.setQueryData< AtmosphereScopedProfile >( key, ( old ) =>
				old
					? {
							...old,
							viewer: {
								...old.viewer,
								following: null,
								following_rkey: null,
							},
					  }
					: old
			);
			const actorListSnapshots = patchActorListsForSubject(
				queryClient,
				vars.connectionId,
				vars.subjectDid,
				{
					following: null,
					following_rkey: null,
				}
			);
			return { previous, actorListSnapshots };
		},
		onError: ( _err, vars, context ) => {
			if ( context?.previous ) {
				queryClient.setQueryData( scopedProfileKey( vars ), context.previous );
			}
			if ( context?.actorListSnapshots?.length ) {
				restoreActorListSnapshots( queryClient, context.actorListSnapshots );
			}
		},
	} );

interface OptimisticContext {
	snapshots: Array< {
		key: QueryKey;
		items: Array< { itemKey: string; occurrence: number; item: AtmosphereFeedItem } >;
	} >;
}

interface FeedPageWithItems {
	items: AtmosphereFeedItem[];
	[ key: string ]: unknown;
}

function getOptimisticItemKey( item: AtmosphereFeedItem ): string {
	if ( ! item.reason ) {
		return `${ item.uri }\nreason:none`;
	}
	return `${ item.uri }\nreason:${ item.reason.type }:${ item.reason.by.did }:${ item.reason.by.handle }`;
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
	items: AtmosphereFeedItem[],
	postUri: string,
	patch: ( item: AtmosphereFeedItem ) => AtmosphereFeedItem,
	snapshots: OptimisticContext[ 'snapshots' ][ number ][ 'items' ],
	seenOccurrences: Map< string, number >
): AtmosphereFeedItem[] {
	return items.map( ( item ) => {
		if ( item.uri !== postUri ) {
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
	node: AtmosphereThreadNode,
	postUri: string,
	patch: ( item: AtmosphereFeedItem ) => AtmosphereFeedItem,
	snapshots: OptimisticContext[ 'snapshots' ][ number ][ 'items' ],
	seenOccurrences: Map< string, number >
): AtmosphereThreadNode {
	if ( node.type !== 'post' ) {
		return node;
	}

	const beforeSnapshotCount = snapshots.length;
	const post =
		node.post.uri === postUri
			? patchFeedItems( [ node.post ], postUri, patch, snapshots, seenOccurrences )[ 0 ]
			: node.post;
	const parent = node.parent
		? patchThreadNode( node.parent, postUri, patch, snapshots, seenOccurrences )
		: null;
	const replies = node.replies.map( ( reply ) =>
		patchThreadNode( reply, postUri, patch, snapshots, seenOccurrences )
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

function patchAtmosphereQueryData(
	data: unknown,
	postUri: string,
	patch: ( item: AtmosphereFeedItem ) => AtmosphereFeedItem
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
								items: patchFeedItems( page.items, postUri, patch, items, seenOccurrences ),
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
					data.thread as unknown as AtmosphereThreadNode,
					postUri,
					patch,
					items,
					seenOccurrences
				),
			},
		};
	}

	return { data, items };
}

function patchAtmospherePostCaches(
	queryClient: QueryClient,
	postUri: string,
	patch: ( item: AtmosphereFeedItem ) => AtmosphereFeedItem
): OptimisticContext {
	const snapshots: OptimisticContext[ 'snapshots' ] = [];
	for ( const [ key, data ] of queryClient.getQueriesData( {
		queryKey: readerAtmosphereKeys.all,
	} ) ) {
		const result = patchAtmosphereQueryData( data, postUri, patch );
		if ( ! result.items.length ) {
			continue;
		}
		queryClient.setQueryData( key, result.data );
		snapshots.push( { key, items: result.items } );
	}
	return { snapshots };
}

/**
 * Patch the `embed` field of every cached `AtmosphereFeedItem` whose
 * `uri` matches `postUri`, across all atmosphere queries (timeline,
 * author-feed, thread, tag-feed). Used by the composer to inject a
 * local-preview-URL embed onto the just-published placeholder so the
 * timeline shows the user's just-attached images during the brief
 * window before the next refetch replaces them with real CDN URLs from
 * the AppView.
 *
 * No rollback is captured: this runs AFTER the mutation succeeds and is
 * superseded by the next refetch. If no cache entry matches `postUri`
 * (placeholder evicted, cache cold), the call is a no-op.
 */
export function setAtmospherePostEmbed(
	queryClient: QueryClient,
	postUri: string,
	embed: AtmosphereEmbed
): void {
	patchAtmospherePostCaches( queryClient, postUri, ( item ) => ( { ...item, embed } ) );
}

function restoreFeedItems(
	items: AtmosphereFeedItem[],
	itemSnapshots: Map< string, AtmosphereFeedItem[] >,
	seenOccurrences: Map< string, number >
): AtmosphereFeedItem[] {
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
	node: AtmosphereThreadNode,
	itemSnapshots: Map< string, AtmosphereFeedItem[] >,
	seenOccurrences: Map< string, number >
): AtmosphereThreadNode {
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

function restoreAtmosphereQueryData(
	data: unknown,
	items: OptimisticContext[ 'snapshots' ][ number ][ 'items' ]
): unknown {
	const itemSnapshots = new Map< string, AtmosphereFeedItem[] >();
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
				data.thread as unknown as AtmosphereThreadNode,
				itemSnapshots,
				seenOccurrences
			),
		};
	}

	return data;
}

function restoreAtmospherePostSnapshots(
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
		queryClient.setQueryData( key, restoreAtmosphereQueryData( current, items ) );
	}
}

export function useCreateLikeMutation( connectionId: number ) {
	const queryClient = useQueryClient();
	return useMutation<
		CreateLikeResult,
		AtmosphereError,
		{ postUri: string; postCid: string },
		OptimisticContext
	>( {
		mutationFn: ( { postUri, postCid } ) => createLike( { connectionId, postUri, postCid } ),
		onMutate: async ( { postUri } ) => {
			await queryClient.cancelQueries( {
				queryKey: readerAtmosphereKeys.all,
			} );
			return patchAtmospherePostCaches( queryClient, postUri, ( item ) => ( {
				...item,
				viewer: {
					...( item.viewer ?? { like: null, repost: null } ),
					like: PENDING_LIKE_URI,
				},
				counts: { ...item.counts, likes: item.counts.likes + 1 },
			} ) );
		},
		onError: ( _err, _vars, ctx ) => restoreAtmospherePostSnapshots( queryClient, ctx ),
		onSuccess: ( result, { postUri } ) => {
			patchAtmospherePostCaches( queryClient, postUri, ( item ) => ( {
				...item,
				viewer: {
					...( item.viewer ?? { like: null, repost: null } ),
					like: result.uri,
				},
			} ) );
		},
	} );
}

export function useDeleteLikeMutation( connectionId: number ) {
	const queryClient = useQueryClient();
	return useMutation< void, AtmosphereError, { rkey: string; postUri: string }, OptimisticContext >(
		{
			mutationFn: ( { rkey } ) => deleteLike( { connectionId, rkey } ),
			onMutate: async ( { postUri } ) => {
				await queryClient.cancelQueries( {
					queryKey: readerAtmosphereKeys.all,
				} );
				return patchAtmospherePostCaches( queryClient, postUri, ( item ) => ( {
					...item,
					viewer: {
						...( item.viewer ?? { like: null, repost: null } ),
						like: null,
					},
					counts: { ...item.counts, likes: Math.max( 0, item.counts.likes - 1 ) },
				} ) );
			},
			onError: ( _err, _vars, ctx ) => restoreAtmospherePostSnapshots( queryClient, ctx ),
		}
	);
}

export function useCreateRepostMutation( connectionId: number ) {
	const queryClient = useQueryClient();
	return useMutation<
		CreateRepostResult,
		AtmosphereError,
		{ postUri: string; postCid: string },
		OptimisticContext
	>( {
		mutationFn: ( { postUri, postCid } ) => createRepost( { connectionId, postUri, postCid } ),
		onMutate: async ( { postUri } ) => {
			await queryClient.cancelQueries( {
				queryKey: readerAtmosphereKeys.all,
			} );
			return patchAtmospherePostCaches( queryClient, postUri, ( item ) => ( {
				...item,
				viewer: {
					...( item.viewer ?? { like: null, repost: null } ),
					repost: PENDING_REPOST_URI,
				},
				counts: { ...item.counts, reposts: item.counts.reposts + 1 },
			} ) );
		},
		onError: ( _err, _vars, ctx ) => restoreAtmospherePostSnapshots( queryClient, ctx ),
		onSuccess: ( result, { postUri } ) => {
			patchAtmospherePostCaches( queryClient, postUri, ( item ) => ( {
				...item,
				viewer: {
					...( item.viewer ?? { like: null, repost: null } ),
					repost: result.uri,
				},
			} ) );
		},
	} );
}

export function useDeleteRepostMutation( connectionId: number ) {
	const queryClient = useQueryClient();
	return useMutation< void, AtmosphereError, { rkey: string; postUri: string }, OptimisticContext >(
		{
			mutationFn: ( { rkey } ) => deleteRepost( { connectionId, rkey } ),
			onMutate: async ( { postUri } ) => {
				await queryClient.cancelQueries( {
					queryKey: readerAtmosphereKeys.all,
				} );
				return patchAtmospherePostCaches( queryClient, postUri, ( item ) => ( {
					...item,
					viewer: {
						...( item.viewer ?? { like: null, repost: null } ),
						repost: null,
					},
					counts: {
						...item.counts,
						reposts: Math.max( 0, item.counts.reposts - 1 ),
					},
				} ) );
			},
			onError: ( _err, _vars, ctx ) => restoreAtmospherePostSnapshots( queryClient, ctx ),
		}
	);
}

interface RemovalContext {
	prev: Array< { key: QueryKey; data: unknown } >;
	/**
	 * Snapshot from patchAtmospherePostCaches for the reply parent's counts.replies decrement.
	 *  Only present when the deleted post was a reply and `replyParentUri` was supplied.
	 */
	parentCounts?: OptimisticContext;
}

function removePostFromAtmosphereCaches(
	queryClient: QueryClient,
	postUri: string
): RemovalContext {
	const prev: RemovalContext[ 'prev' ] = [];
	for ( const [ key, data ] of queryClient.getQueriesData( {
		queryKey: readerAtmosphereKeys.all,
	} ) ) {
		if ( ! data ) {
			continue;
		}
		const next = removePostFromQueryData( data, postUri );
		if ( next === data ) {
			continue;
		}
		prev.push( { key, data } );
		queryClient.setQueryData( key, next );
	}
	return { prev };
}

/**
 * Remove or tombstone a single post from one cached query entry.
 *
 * Coverage:
 *  - Feed lists: walks `pages[].items[]` and filters out the matching URI.
 *  - Thread caches: walks the `thread.*` tree and replaces the matching node
 *    with `{ type: 'not_found', uri }` (a tombstone). Children of the
 *    tombstoned node are dropped because `tombstoneThreadNode` returns
 *    immediately on match without descending further.
 *
 * Gap — quote-embed references in OTHER posts that quote the deleted one:
 *  This function (and `patchAtmospherePostCaches`) do NOT walk
 *  `embed.type === 'quote'` references in feed items. A post that quotes the
 *  deleted post will continue to show a stale quote card until the next
 *  refetch. A future enhancement could replace matched quote embeds with an
 *  `AtmosphereQuoteNotFoundTombstone`. Track as a follow-up if user-visible
 *  quote-embed staleness becomes a problem.
 */
function removePostFromQueryData( data: unknown, postUri: string ): unknown {
	if ( isInfiniteFeedData( data ) ) {
		let mutated = false;
		const pages = data.pages.map( ( page ) => {
			if ( ! Array.isArray( page.items ) ) {
				return page;
			}
			const filtered = page.items.filter( ( item ) => item.uri !== postUri );
			if ( filtered.length === page.items.length ) {
				return page;
			}
			mutated = true;
			return { ...page, items: filtered };
		} );
		return mutated ? { ...data, pages } : data;
	}

	if ( isObject( data ) && isObject( data.thread ) ) {
		const prevThread = data.thread as unknown as AtmosphereThreadNode;
		const nextThread = tombstoneThreadNode( prevThread, postUri );
		return nextThread === prevThread ? data : { ...data, thread: nextThread };
	}

	return data;
}

function tombstoneThreadNode( node: AtmosphereThreadNode, postUri: string ): AtmosphereThreadNode {
	if ( node.type !== 'post' ) {
		return node;
	}
	if ( node.post.uri === postUri ) {
		return { type: 'not_found', uri: postUri };
	}
	const parent = node.parent ? tombstoneThreadNode( node.parent, postUri ) : null;
	const replies = node.replies.map( ( reply ) => tombstoneThreadNode( reply, postUri ) );
	if (
		parent === node.parent &&
		replies.every( ( reply, idx ) => reply === node.replies[ idx ] )
	) {
		return node;
	}
	return { ...node, parent, replies };
}

function restoreRemovalContext( queryClient: QueryClient, ctx: RemovalContext | undefined ) {
	if ( ! ctx ) {
		return;
	}
	for ( const { key, data } of ctx.prev ) {
		queryClient.setQueryData( key, data );
	}
}

interface DeletePostMutationVars {
	rkey: string;
	postUri: string;
	replyParentUri?: string;
}

interface DeletePostMutationCallbacks {
	/**
	 * Fired after the cache has been invalidated on a successful DELETE.
	 * Survives the component unmount that follows the optimistic removal,
	 * because the factory's lifecycle callbacks run from `Mutation.execute`
	 * (mutation-cache-owned) rather than the observer (component-owned).
	 * Use this for user-facing notices and Tracks events that must fire
	 * even when `<PostActionsMenu>` unmounts as the post leaves the list.
	 */
	onSuccess?: ( vars: DeletePostMutationVars ) => void;
	/**
	 * Fired after the cache rollback runs (or, for an idempotent 404,
	 * fired without a rollback). Same unmount-safety reasoning as
	 * `onSuccess` — keeps the user-facing error notice and the
	 * not_found / error_shown Tracks events out of the per-call options
	 * passed to `mutate(...)`, which are skipped when the observer has
	 * no listeners.
	 */
	onError?: ( err: AtmosphereError, vars: DeletePostMutationVars ) => void;
}

export function useDeletePostMutation(
	connectionId: number,
	callbacks?: DeletePostMutationCallbacks
) {
	const queryClient = useQueryClient();
	return useMutation< void, AtmosphereError, DeletePostMutationVars, RemovalContext >( {
		mutationFn: ( { rkey } ) => deletePost( { connectionId, rkey } ),
		onMutate: async ( { postUri, replyParentUri } ) => {
			await queryClient.cancelQueries( { queryKey: readerAtmosphereKeys.all } );

			// Snapshot and remove the deleted post first, before touching the
			// parent counts. This way `prev` captures the page's original state
			// (parent still at its pre-decrement reply count), so restoring `prev`
			// on error is sufficient for any page that contained both the parent
			// and the deleted reply.
			const ctx = removePostFromAtmosphereCaches( queryClient, postUri );

			// When deleting a reply, decrement the parent's counts.replies in
			// every cache where the parent appears. We do this AFTER the removal
			// pass so that `prev` already holds the original page data.
			// For pages that contain the parent but NOT the deleted reply,
			// parentCounts covers the rollback (the removal pass won't have
			// touched those pages, so `prev` has no entry for them).
			let parentCounts: OptimisticContext | undefined;
			if ( replyParentUri ) {
				parentCounts = patchAtmospherePostCaches( queryClient, replyParentUri, ( item ) => ( {
					...item,
					counts: {
						...item.counts,
						replies: Math.max( 0, item.counts.replies - 1 ),
					},
				} ) );
			}

			return { ...ctx, parentCounts };
		},
		onError: ( err, vars, ctx ) => {
			if ( err.kind !== 'not_found' ) {
				// Restore parent-counts patch first. For pages that also contained
				// the deleted reply, the subsequent removal snapshot restore will
				// overwrite with the full prior page data (redundant but harmless —
				// since `prev` was taken before the parent-count patch, it already
				// carries the original count). For pages that only contained the
				// parent, this is the only restore path.
				if ( ctx?.parentCounts ) {
					restoreAtmospherePostSnapshots( queryClient, ctx.parentCounts );
				}
				restoreRemovalContext( queryClient, ctx );
			}
			// `not_found` is idempotent — keep optimistic removal in place and
			// let the next refetch confirm. The consumer callback still fires so
			// it can emit a `_post_delete_not_found` Tracks event without a notice.
			callbacks?.onError?.( err, vars );
		},
		onSuccess: ( _data, vars ) => {
			// Invalidate via prefix so we cover every cached `actor` (handle or DID)
			// and every `filter` variant. Real consumers key these caches by the
			// route param (typically the handle), not by DID, so a DID-keyed
			// invalidation would miss the active surface.
			queryClient.invalidateQueries( {
				queryKey: [ ...readerAtmosphereKeys.all, 'scoped-author-feed', connectionId ],
			} );
			queryClient.invalidateQueries( {
				queryKey: [ ...readerAtmosphereKeys.all, 'scoped-profile', connectionId ],
			} );
			callbacks?.onSuccess?.( vars );
		},
	} );
}

export const atmosphereTagFeedInfiniteQuery = ( connectionId: number, hashtag: string ) => {
	const canonicalHashtag = hashtag.trim().toLowerCase().replace( /^#/, '' );
	return infiniteQueryOptions<
		AtmosphereTagFeedPage,
		AtmosphereError,
		InfiniteData< AtmosphereTagFeedPage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerAtmosphereKeys.tagFeed( connectionId, canonicalHashtag ),
		queryFn: ( { pageParam } ) =>
			getAtmosphereTagFeed( { connectionId, hashtag: canonicalHashtag, cursor: pageParam } ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage ) => lastPage.cursor || undefined,
		enabled: connectionId > 0 && isValidHashtag( canonicalHashtag ),
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		retry: ( failureCount, error ) => {
			if ( isTerminalError( error ) ) {
				return false;
			}
			return failureCount < 2;
		},
	} );
};

export function useAtmosphereTagFeedInfiniteQuery( connectionId: number, hashtag: string ) {
	return useInfiniteQuery( atmosphereTagFeedInfiniteQuery( connectionId, hashtag ) );
}

interface CreatePostContext {
	// Snapshots from `patchAtmospherePostCaches`, covering parent-count
	// bumps in timeline / profile / tag-feed (and the in-thread parent
	// post node, since the thread cache is in `readerAtmosphereKeys.all`).
	parentCountsContext: OptimisticContext;
	// Full pre-mutation thread snapshot for `root.uri`. Captured *before*
	// `patchAtmospherePostCaches` runs so it reverts both the count bump
	// and the placeholder insertion in a single setQueryData call.
	threadKey: QueryKey | null;
	threadPrevious: AtmosphereThreadResponse | undefined;
	// Per-mutation placeholder URI. Two replies in flight at the same
	// time would otherwise collide on the shared `PENDING_REPLY_URI`
	// sentinel — `replacePlaceholderInThread` would rewrite whichever
	// node it found first when the second response landed, losing the
	// other reply. Each mutation stamps its own suffix so onSuccess
	// rewrites only its own placeholder.
	pendingUri: string;
	// Standalone-mode timeline snapshot — captured before the placeholder
	// is prepended so onError can revert atomically. Undefined when the
	// mutation is a reply or quote (those branches don't touch the
	// timeline cache directly; `parentCountsContext` covers them).
	timelineSnapshot?: {
		queryKey: QueryKey;
		previous: InfiniteData< AtmosphereTimelinePage > | undefined;
	};
	// Standalone-mode author-feed snapshots — one per filter variant the
	// placeholder was prepended into (no-filter / posts_no_replies /
	// posts_with_replies / posts_and_author_threads; posts_with_media
	// is skipped since text-only posts don't surface there). Always an
	// array so onError can iterate without a null check; empty for
	// reply / quote mutations or when the connection handle isn't yet
	// in cache.
	authorFeedSnapshots: Array< {
		queryKey: QueryKey;
		previous: InfiniteData< AtmosphereAuthorFeedPage > | undefined;
	} >;
}

// Module-level counter producing collision-free pending URIs. Suffix is
// a `#`-separated ordinal so the result is still parseable by anything
// that does a `startsWith( PENDING_REPLY_URI )` check; `rkeyFromUri`
// already returns null because the result does not start with `at://`.
let pendingReplyCounter = 0;
const nextPendingReplyUri = () => `${ PENDING_REPLY_URI }#${ ++pendingReplyCounter }`;

// Sibling counter for in-flight standalone composer posts. Same shape as
// `nextPendingReplyUri` but anchored on `PENDING_POST_URI` so consumers can
// distinguish a placeholder root post from a placeholder reply by sentinel
// prefix alone.
let pendingPostCounter = 0;
export const nextPendingPostUri = () => `${ PENDING_POST_URI }#${ ++pendingPostCounter }`;

// Breadcrumb for the post-creation invalidate-as-fallback paths. Each
// branch firing means the placeholder couldn't be swapped in place
// (cache evicted, concurrent refetch, etc.), and we're falling back to
// a server refetch. console.debug is suppressed by default in browsers,
// so this only surfaces to anyone with devtools open and debug-level
// filtering on.
function logPlaceholderLost( reason: string ) {
	// eslint-disable-next-line no-console
	console.debug( `[atmosphere] createPostMutation: invalidating (${ reason })` );
}

function authorFromConnection(
	connection: AtmosphereConnectionDetails | undefined
): AtmosphereAuthor {
	if ( ! connection ) {
		return { did: '', handle: '', display_name: '', avatar: null };
	}
	return {
		did: connection.did,
		handle: connection.handle,
		display_name: connection.display_name ?? '',
		avatar: connection.avatar,
	};
}

/**
 * Build a placeholder `AtmosphereFeedItem` representing an in-flight
 * reply. The URI is a `PENDING_REPLY_URI`-prefixed sentinel unique to
 * the in-flight mutation so consumers can detect the optimistic state
 * and suppress race-y delete actions, and so concurrent replies do not
 * collide on rewrite.
 *
 * The author is hydrated from the cached connection details so the
 * placeholder renders with the user's real handle / display name /
 * avatar instead of a blank chip while the request is in flight (and,
 * after onSuccess rewrites the URI / CID, until the next thread
 * refetch). When the connection cache is cold the author falls back to
 * empty fields — `replacePlaceholderInThread` re-applies the connection
 * lookup on success so a late cache populate still corrects the chip.
 */
function buildPlaceholderReply(
	text: string,
	pendingUri: string,
	connection: AtmosphereConnectionDetails | undefined
): AtmosphereFeedItem {
	const now = new Date().toISOString();
	return {
		uri: pendingUri,
		cid: '',
		author: authorFromConnection( connection ),
		created_at: now,
		indexed_at: now,
		text,
		html: '',
		lang: [],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
		viewer: { like: null, repost: null },
		bluesky_url: '',
	};
}

/**
 * Build a placeholder `AtmosphereFeedItem` representing an in-flight
 * standalone composer post. Shape-wise this is identical to
 * `buildPlaceholderReply` — both produce a feed item with a sentinel
 * `uri`, empty `cid`, hydrated author, current ISO timestamps, empty
 * counts, and null `reply_parent` / `reply_root`. The semantic
 * difference is the URI sentinel comes from `PENDING_POST_URI` and the
 * downstream consumer prepends to the timeline / author-feed caches
 * rather than splicing under a parent in the thread tree.
 *
 * Kept as its own function (rather than aliasing `buildPlaceholderReply`)
 * so the standalone composer call sites read clearly and so future
 * divergence — say, attaching a default `embed` for link cards — does
 * not have to fork the reply path.
 */
export function buildPlaceholderStandalonePost(
	text: string,
	pendingUri: string,
	connection: AtmosphereConnectionDetails | undefined
): AtmosphereFeedItem {
	const now = new Date().toISOString();
	return {
		uri: pendingUri,
		cid: '',
		author: authorFromConnection( connection ),
		created_at: now,
		indexed_at: now,
		text,
		html: '',
		lang: [],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
		viewer: { like: null, repost: null },
		bluesky_url: '',
	};
}

/**
 * Build a real `AtmosphereFeedItem` from the server's `CreatePostResult`
 * by re-using `buildPlaceholderStandalonePost` for shape and overwriting
 * the URI / CID with the server-assigned values. Keeps the placeholder
 * and the real item perfectly congruent (same author / timestamps /
 * counts / lang / embed shape) so swapping one for the other in the
 * cache is a pure reference change.
 */
export function buildFeedItemFromCreateResult(
	result: CreatePostResult,
	text: string,
	connection: AtmosphereConnectionDetails | undefined
): AtmosphereFeedItem {
	const base = buildPlaceholderStandalonePost( text, result.uri, connection );
	return { ...base, cid: result.cid };
}

/**
 * Walk the thread tree and append a synthesized placeholder reply node
 * under the post node whose `.post.uri` matches `parentUri`. Returns a
 * structurally-shared tree (untouched branches keep their identity).
 */
function insertPlaceholderUnderParent(
	node: AtmosphereThreadNode,
	parentUri: string,
	placeholder: AtmosphereFeedItem
): AtmosphereThreadNode {
	if ( node.type !== 'post' ) {
		return node;
	}
	if ( node.post.uri === parentUri ) {
		return {
			...node,
			replies: [ ...node.replies, { type: 'post', post: placeholder, parent: null, replies: [] } ],
		};
	}
	let changed = false;
	const replies = node.replies.map( ( reply ) => {
		const next = insertPlaceholderUnderParent( reply, parentUri, placeholder );
		if ( next !== reply ) {
			changed = true;
		}
		return next;
	} );
	const parent = node.parent
		? insertPlaceholderUnderParent( node.parent, parentUri, placeholder )
		: null;
	if ( ! changed && parent === node.parent ) {
		return node;
	}
	return { ...node, replies, parent };
}

/**
 * Walk the thread tree and rewrite the placeholder post identified by
 * `pendingUri` with one carrying the real `result.uri` / `result.cid`.
 * Matching on a per-mutation URI prevents concurrent replies from
 * stomping on each other's placeholders. When the placeholder author
 * is still empty (cold connection cache at onMutate time) and a fresh
 * `connection` is now available, fill it in so the chip renders the
 * user's handle / display name / avatar instead of a blank placeholder.
 */
function replacePlaceholderInThread(
	node: AtmosphereThreadNode,
	result: CreatePostResult,
	pendingUri: string,
	connection: AtmosphereConnectionDetails | undefined
): AtmosphereThreadNode {
	if ( node.type !== 'post' ) {
		return node;
	}
	if ( node.post.uri === pendingUri ) {
		const author =
			node.post.author.handle === '' ? authorFromConnection( connection ) : node.post.author;
		return {
			...node,
			post: { ...node.post, uri: result.uri, cid: result.cid, author },
		};
	}
	let changed = false;
	const replies = node.replies.map( ( reply ) => {
		const next = replacePlaceholderInThread( reply, result, pendingUri, connection );
		if ( next !== reply ) {
			changed = true;
		}
		return next;
	} );
	const parent = node.parent
		? replacePlaceholderInThread( node.parent, result, pendingUri, connection )
		: null;
	if ( ! changed && parent === node.parent ) {
		return node;
	}
	return { ...node, replies, parent };
}

/**
 * Swap a standalone-composer placeholder feed item for the real one in
 * an `InfiniteData` page list. Walks pages in order so that if a
 * concurrent refetch shifted the placeholder past page 0 (e.g. fresh
 * items prepended above it), it is still found. Returns the input
 * unchanged when no item with `pendingUri` is present so the caller can
 * decide whether to invalidate as a fallback. Generic over the page
 * shape because timeline pages and author-feed pages share the
 * `{ items: AtmosphereFeedItem[] }` field but otherwise differ.
 *
 * Note: when the placeholder isn't found at all (cache still exists but
 * its placeholder was already removed by a concurrent refetch), the
 * helper just returns `data`. The consumer detects this by reference
 * equality and falls back to `invalidateQueries` so the new post is
 * not silently lost.
 */
export function swapPlaceholder< P extends { items: AtmosphereFeedItem[] } >(
	data: InfiniteData< P >,
	pendingUri: string,
	replacement: AtmosphereFeedItem
): InfiniteData< P > {
	let swapped = false;
	const pages = data.pages.map( ( page ) => {
		if ( swapped ) {
			return page;
		}
		const idx = page.items.findIndex( ( item ) => item.uri === pendingUri );
		if ( idx === -1 ) {
			return page;
		}
		swapped = true;
		const items = [ ...page.items ];
		items[ idx ] = replacement;
		return { ...page, items };
	} );
	return swapped ? { ...data, pages } : data;
}

/**
 * Remove a standalone-composer placeholder feed item from an
 * `InfiniteData` page list. Walks pages in order and strips the first
 * item whose `uri` matches `pendingUri`. Returns the input unchanged
 * when no match is found.
 *
 * Used by `onError` to clean up the optimistic prepend without
 * clobbering sibling state. A whole-tree snapshot restore would also
 * wipe placeholders prepended by concurrent mutations between this
 * mutation's onMutate and onError, so surgical removal is required for
 * concurrency safety.
 */
export function removePlaceholder< P extends { items: AtmosphereFeedItem[] } >(
	data: InfiniteData< P >,
	pendingUri: string
): InfiniteData< P > {
	let removed = false;
	const pages = data.pages.map( ( page ) => {
		if ( removed ) {
			return page;
		}
		const idx = page.items.findIndex( ( item ) => item.uri === pendingUri );
		if ( idx === -1 ) {
			return page;
		}
		removed = true;
		const items = page.items.slice( 0, idx ).concat( page.items.slice( idx + 1 ) );
		return { ...page, items };
	} );
	return removed ? { ...data, pages } : data;
}

/**
 * Wraps the uploadBlob fetcher. No cache invalidation needed — blob
 * uploads are a transient step toward createPost. The QueryClient
 * parameter is kept for symmetry with sibling factories in this module
 * so future cache touches don't refactor the call sites.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const uploadBlobMutation = ( _queryClient: QueryClient ) =>
	mutationOptions< UploadBlobResult, AtmosphereError, UploadBlobParams >( {
		mutationFn: uploadBlob,
	} );

/**
 * Mutation factory for creating an `app.bsky.feed.post` record.
 *
 * In reply mode, optimistically:
 *   1. Inserts a `PENDING_REPLY_URI` placeholder reply under the parent
 *      node in the cached thread query for `reply.root.uri`.
 *   2. Bumps `counts.replies` on the parent post in every cached
 *      timeline / profile / tag-feed page (and, transitively, in the
 *      thread cache where the parent appears as a post node).
 *
 * On error both snapshots are restored.
 *
 * On success the placeholder URI/cid in the thread cache is rewritten
 * to the real values returned by the server. The optimistic count bump
 * stays — it matches the server's post-success state.
 *
 * Standalone-mode posts prepend a placeholder to the timeline and
 * author-feed caches and swap it on success (rolling back to the snapshot on
 * error). Quote-mode cache patching is not yet implemented.
 *
 * Accepts the consumer's QueryClient because Calypso boots its own
 * separate from the singleton in `@automattic/api-queries`. See
 * `client/reader/AGENTS.md` for the rationale.
 */
export const createPostMutation = ( queryClient: QueryClient ) =>
	mutationOptions< CreatePostResult, AtmosphereError, CreatePostParams, CreatePostContext >( {
		mutationFn: createPost,
		onMutate: async ( vars ) => {
			await queryClient.cancelQueries( { queryKey: readerAtmosphereKeys.all } );

			const ctx: CreatePostContext = {
				parentCountsContext: { snapshots: [] },
				threadKey: null,
				threadPrevious: undefined,
				pendingUri: nextPendingReplyUri(),
				authorFeedSnapshots: [],
			};

			if ( ! vars.reply && ! vars.quote ) {
				// Standalone composer post — prepend a placeholder to the
				// connected user's timeline and to every author-feed filter
				// where a fresh top-level post should appear. Snapshot each
				// patched cache first so onError can restore atomically. No
				// `counts.*` bumps here: a brand-new top-level post has no
				// parent reference.
				ctx.pendingUri = nextPendingPostUri();
				const connection = queryClient.getQueryData< AtmosphereConnectionDetails >(
					readerAtmosphereKeys.connection( vars.connectionId )
				);
				const placeholder = buildPlaceholderStandalonePost( vars.text, ctx.pendingUri, connection );

				// Timeline cache is keyed on connection id alone, so the
				// patch works even when the connection details cache is
				// cold (deep-link / first-load case).
				const timelineKey = readerAtmosphereKeys.timeline( vars.connectionId );
				const timelinePrev =
					queryClient.getQueryData< InfiniteData< AtmosphereTimelinePage > >( timelineKey );
				ctx.timelineSnapshot = { queryKey: timelineKey, previous: timelinePrev };
				if ( timelinePrev && timelinePrev.pages.length > 0 ) {
					const [ firstPage, ...restPages ] = timelinePrev.pages;
					queryClient.setQueryData< InfiniteData< AtmosphereTimelinePage > >( timelineKey, {
						...timelinePrev,
						pages: [ { ...firstPage, items: [ placeholder, ...firstPage.items ] }, ...restPages ],
					} );
				}

				// Author-feed caches are keyed on the user's handle, which
				// only comes from the cached connection details. When that
				// cache is cold (cold deep-link), skip the prepend — the
				// success path's invalidate will repopulate.
				const handle = connection?.handle;
				if ( handle ) {
					// `posts_with_media` deliberately skipped: text-only
					// posts from this composer never carry an embed, so
					// prepending would seed a phantom item that the server
					// would never confirm.
					const filters: Array< AtmosphereAuthorFeedFilter | undefined > = [
						undefined,
						'posts_no_replies',
						'posts_with_replies',
						'posts_and_author_threads',
					];
					for ( const filter of filters ) {
						const key = readerAtmosphereKeys.authorFeed( handle, filter );
						const prev =
							queryClient.getQueryData< InfiniteData< AtmosphereAuthorFeedPage > >( key );
						ctx.authorFeedSnapshots.push( { queryKey: key, previous: prev } );
						if ( prev && prev.pages.length > 0 ) {
							const [ firstPage, ...restPages ] = prev.pages;
							queryClient.setQueryData< InfiniteData< AtmosphereAuthorFeedPage > >( key, {
								...prev,
								pages: [
									{ ...firstPage, items: [ placeholder, ...firstPage.items ] },
									...restPages,
								],
							} );
						}
					}
				}

				return ctx;
			}

			if ( ! vars.reply ) {
				// Quote-only branch — cache patching for quotes is not yet
				// implemented; carry the per-mutation pending URI so the
				// success / error paths have a stable context shape.
				return ctx;
			}

			const { root, parent } = vars.reply;
			const threadKey = readerAtmosphereKeys.thread( root.uri );
			ctx.threadKey = threadKey;
			ctx.threadPrevious = queryClient.getQueryData< AtmosphereThreadResponse >( threadKey );

			// Bump counts.replies on the parent post in every atmosphere
			// cache where it appears (timeline / profile / tag-feed AND
			// the parent post node inside the thread tree).
			ctx.parentCountsContext = patchAtmospherePostCaches( queryClient, parent.uri, ( item ) => ( {
				...item,
				counts: { ...item.counts, replies: item.counts.replies + 1 },
			} ) );

			// Layer the placeholder reply under the parent node in the
			// thread cache. Done after `patchAtmospherePostCaches` so the
			// already-bumped parent post stays bumped. The placeholder
			// author is hydrated from the cached connection details so the
			// optimistic chip carries the user's real handle / avatar.
			const threadAfterBump = queryClient.getQueryData< AtmosphereThreadResponse >( threadKey );
			if ( threadAfterBump ) {
				const connection = queryClient.getQueryData< AtmosphereConnectionDetails >(
					readerAtmosphereKeys.connection( vars.connectionId )
				);
				const placeholder = buildPlaceholderReply( vars.text, ctx.pendingUri, connection );
				queryClient.setQueryData< AtmosphereThreadResponse >( threadKey, {
					...threadAfterBump,
					thread: insertPlaceholderUnderParent( threadAfterBump.thread, parent.uri, placeholder ),
				} );
			}

			return ctx;
		},
		onError: ( _err, _vars, ctx ) => {
			if ( ! ctx ) {
				return;
			}
			// Standalone-mode rollback: surgically remove only this
			// mutation's placeholder by `pendingUri`. A whole-tree
			// snapshot restore would also wipe placeholders prepended
			// by sibling mutations that ran between this mutation's
			// onMutate and onError. Both branches are no-ops for reply
			// / quote mutations (timelineSnapshot is undefined,
			// authorFeedSnapshots is []).
			if ( ctx.timelineSnapshot ) {
				const current = queryClient.getQueryData< InfiniteData< AtmosphereTimelinePage > >(
					ctx.timelineSnapshot.queryKey
				);
				if ( current ) {
					queryClient.setQueryData< InfiniteData< AtmosphereTimelinePage > >(
						ctx.timelineSnapshot.queryKey,
						removePlaceholder( current, ctx.pendingUri )
					);
				}
			}
			for ( const snap of ctx.authorFeedSnapshots ) {
				const current = queryClient.getQueryData< InfiniteData< AtmosphereAuthorFeedPage > >(
					snap.queryKey
				);
				if ( current ) {
					queryClient.setQueryData< InfiniteData< AtmosphereAuthorFeedPage > >(
						snap.queryKey,
						removePlaceholder( current, ctx.pendingUri )
					);
				}
			}

			// Reply-mode restore: revert the thread cache (placeholder +
			// count bump in one shot) before `restoreAtmospherePostSnapshots`
			// so that helper sees the already-restored thread (its restore
			// pass is a no-op there).
			if ( ctx.threadKey && ctx.threadPrevious !== undefined ) {
				queryClient.setQueryData( ctx.threadKey, ctx.threadPrevious );
			}
			restoreAtmospherePostSnapshots( queryClient, ctx.parentCountsContext );
		},
		onSuccess: ( result, vars, ctx ) => {
			if ( ! ctx ) {
				return;
			}

			// Standalone branch — swap the placeholder we prepended in
			// onMutate (timeline + each patched author-feed cache) for an
			// item carrying the real `uri` / `cid`. When a cache was
			// evicted between onMutate and onSuccess (gc, route change,
			// manual removeQueries), invalidate it so the real post
			// re-materialises from the server on next read instead of
			// being silently lost.
			if ( ! vars.reply && ! vars.quote ) {
				const connection = queryClient.getQueryData< AtmosphereConnectionDetails >(
					readerAtmosphereKeys.connection( vars.connectionId )
				);
				const realItem = buildFeedItemFromCreateResult( result, vars.text, connection );

				if ( ctx.timelineSnapshot ) {
					const timelineKey = ctx.timelineSnapshot.queryKey;
					const current =
						queryClient.getQueryData< InfiniteData< AtmosphereTimelinePage > >( timelineKey );
					if ( ! current ) {
						logPlaceholderLost( 'timeline cache evicted' );
						queryClient.invalidateQueries( { queryKey: timelineKey } );
					} else {
						const next = swapPlaceholder( current, ctx.pendingUri, realItem );
						if ( next === current ) {
							// Placeholder evicted between onMutate and onSuccess
							// (concurrent refetch / sibling mutation rollback).
							// Mirror the reply path: invalidate so the new post
							// re-materialises from the server instead of being
							// silently lost.
							logPlaceholderLost( 'timeline placeholder missing' );
							queryClient.invalidateQueries( { queryKey: timelineKey } );
						} else {
							queryClient.setQueryData< InfiniteData< AtmosphereTimelinePage > >(
								timelineKey,
								next
							);
						}
					}
				}

				for ( const snap of ctx.authorFeedSnapshots ) {
					const current = queryClient.getQueryData< InfiniteData< AtmosphereAuthorFeedPage > >(
						snap.queryKey
					);
					if ( ! current ) {
						logPlaceholderLost( 'author-feed cache evicted' );
						queryClient.invalidateQueries( { queryKey: snap.queryKey } );
						continue;
					}
					const next = swapPlaceholder( current, ctx.pendingUri, realItem );
					if ( next === current ) {
						logPlaceholderLost( 'author-feed placeholder missing' );
						queryClient.invalidateQueries( { queryKey: snap.queryKey } );
						continue;
					}
					queryClient.setQueryData< InfiniteData< AtmosphereAuthorFeedPage > >(
						snap.queryKey,
						next
					);
				}

				return;
			}

			if ( ! vars.reply ) {
				// Quote-only success — cache patching for quotes is not yet
				// implemented.
				return;
			}

			const threadKey = readerAtmosphereKeys.thread( vars.reply.root.uri );
			const current = queryClient.getQueryData< AtmosphereThreadResponse >( threadKey );
			if ( ! current ) {
				// Cache evicted between onMutate and onSuccess (gc, route
				// change, manual removeQueries). Schedule a refetch so the
				// real reply does not silently disappear next time the
				// thread is opened.
				logPlaceholderLost( 'thread cache evicted' );
				queryClient.invalidateQueries( { queryKey: threadKey } );
				return;
			}
			// Re-resolve the connection on success: a deep-link can land in
			// the thread surface before the connection cache populates, so
			// the placeholder built in onMutate may have an empty author.
			const connection = queryClient.getQueryData< AtmosphereConnectionDetails >(
				readerAtmosphereKeys.connection( vars.connectionId )
			);
			const next = replacePlaceholderInThread( current.thread, result, ctx.pendingUri, connection );
			if ( next === current.thread ) {
				// Tree shape shifted between onMutate and onSuccess (e.g. a
				// concurrent refetch dropped the placeholder branch). Fall
				// back to invalidate so the reply re-materialises from the
				// server rather than being silently lost.
				logPlaceholderLost( 'thread placeholder missing' );
				queryClient.invalidateQueries( { queryKey: threadKey } );
				return;
			}
			queryClient.setQueryData< AtmosphereThreadResponse >( threadKey, {
				...current,
				thread: next,
			} );
		},
	} );
