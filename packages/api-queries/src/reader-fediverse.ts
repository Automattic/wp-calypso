import {
	getFediverseAuthorFeed,
	getFediverseAuthorProfile,
	getFediverseConnection,
	getFediverseConnections,
	getFediverseTimeline,
	readerFediverseKeys,
} from '@automattic/api-core';
import {
	infiniteQueryOptions,
	queryOptions,
	useInfiniteQuery,
	useQuery,
	type InfiniteData,
	type QueryKey,
} from '@tanstack/react-query';
import type {
	FediverseAuthorFeedPage,
	FediverseAuthorProfile,
	FediverseConnection,
	FediverseConnectionsResponse,
	FediverseError,
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

// Normalise an actor string for cache keying. Mirrors the Mastodon
// implementation: trim, drop a leading `@`, lowercase. Webfinger handles
// (`alice@example.com`, `@alice@example.com`, `@Alice@EXAMPLE.com`) all
// dedupe to the same key. Numeric ids and URL-shaped actors (which the
// backend also accepts) pass through unchanged below — only the leading
// `@` and case are normalised.
function normalizeActor( actor: string ): string {
	const trimmed = actor.trim();
	const stripped = trimmed.startsWith( '@' ) ? trimmed.slice( 1 ) : trimmed;
	return stripped.toLowerCase();
}

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
