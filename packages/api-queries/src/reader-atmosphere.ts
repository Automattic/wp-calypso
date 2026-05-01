import {
	createConnection,
	createFollow,
	createLike,
	deleteFollow,
	deleteLike,
	getAtmosphereTagFeed,
	getAuthorFeed,
	getAuthorProfile,
	getConnection,
	getConnections,
	getScopedProfile,
	getThread,
	getTimeline,
	PENDING_LIKE_URI,
	isValidHashtag,
	readerAtmosphereKeys,
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
	AtmosphereAuthorFeedFilter,
	AtmosphereAuthorFeedPage,
	AtmosphereAuthorProfile,
	AtmosphereConnectionDetails,
	AtmosphereConnectionsResponse,
	AtmosphereCreateConnectionResponse,
	AtmosphereCreateFollowResponse,
	AtmosphereError,
	AtmosphereFeedItem,
	AtmosphereScopedProfile,
	AtmosphereTagFeedPage,
	AtmosphereThreadResponse,
	AtmosphereThreadNode,
	AtmosphereTimelinePage,
	CreateConnectionParams,
	CreateLikeResult,
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

export interface FollowAtmosphereActorVars {
	connectionId: number;
	actor: string;
	subjectDid: string;
}

export interface FollowAtmosphereMutationContext {
	previous: AtmosphereScopedProfile | undefined;
}

const scopedProfileKey = ( vars: { connectionId: number; actor: string } ) =>
	atmosphereScopedProfileQuery( {
		connectionId: vars.connectionId,
		actor: vars.actor,
	} ).queryKey;

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
			await queryClient.cancelQueries( { queryKey: key } );
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
			return { previous };
		},
		onError: ( _err, vars, context ) => {
			if ( context?.previous ) {
				queryClient.setQueryData( scopedProfileKey( vars ), context.previous );
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
		},
	} );

export interface UnfollowAtmosphereActorVars {
	connectionId: number;
	actor: string;
	rkey: string;
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
			await queryClient.cancelQueries( { queryKey: key } );
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
			return { previous };
		},
		onError: ( _err, vars, context ) => {
			if ( context?.previous ) {
				queryClient.setQueryData( scopedProfileKey( vars ), context.previous );
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
