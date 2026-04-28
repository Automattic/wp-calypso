import {
	authorizeMastodonConnection,
	completeMastodonConnection,
	getMastodonConnection,
	getMastodonConnections,
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
	GetMastodonTimelineParams,
	MastodonAuthorizeResponse,
	MastodonConnectionDetails,
	MastodonConnectionsResponse,
	MastodonCreateConnectionResponse,
	MastodonError,
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
	} );

export function useMastodonTimelineInfiniteQuery( connectionId: number ) {
	return useInfiniteQuery( mastodonTimelineInfiniteQuery( connectionId ) );
}
