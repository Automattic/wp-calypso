import {
	createConnection,
	createFollow,
	deleteFollow,
	getAuthorFeed,
	getAuthorProfile,
	getConnection,
	getConnections,
	getScopedProfile,
	getThread,
	getTimeline,
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
	AtmosphereScopedProfile,
	AtmosphereThreadResponse,
	AtmosphereTimelinePage,
	CreateConnectionParams,
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
