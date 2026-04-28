import {
	createConnection,
	getConnection,
	getConnections,
	getTimeline,
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
	AtmosphereConnectionDetails,
	AtmosphereConnectionsResponse,
	AtmosphereCreateConnectionResponse,
	AtmosphereError,
	AtmosphereTimelinePage,
	CreateConnectionParams,
} from '@automattic/api-core';

export const connectionsQueryOptions = () =>
	queryOptions< AtmosphereConnectionsResponse, AtmosphereError >( {
		queryKey: readerAtmosphereKeys.connections(),
		queryFn: getConnections,
		staleTime: 60_000,
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
		getNextPageParam: ( lastPage ) => lastPage.cursor ?? undefined,
		enabled: connectionId > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
	} );

export function useTimelineInfiniteQuery( connectionId: number ) {
	return useInfiniteQuery( timelineInfiniteQuery( connectionId ) );
}
