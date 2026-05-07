import {
	getFediverseConnection,
	getFediverseConnections,
	readerFediverseKeys,
} from '@automattic/api-core';
import { queryOptions, useQuery } from '@tanstack/react-query';
import type {
	FediverseConnection,
	FediverseConnectionsResponse,
	FediverseError,
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
