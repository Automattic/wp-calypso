import {
	createConnection,
	getAtmosphereTagFeed,
	getAuthorFeed,
	getAuthorProfile,
	getConnection,
	getConnections,
	getThread,
	getTimeline,
	isValidHashtag,
	readerAtmosphereKeys,
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
	AtmosphereAuthorFeedFilter,
	AtmosphereAuthorFeedPage,
	AtmosphereAuthorProfile,
	AtmosphereConnectionDetails,
	AtmosphereConnectionsResponse,
	AtmosphereCreateConnectionResponse,
	AtmosphereError,
	AtmosphereTagFeedPage,
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
