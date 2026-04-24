import {
	createMastodonConnection,
	getMastodonConnection,
	getMastodonConnections,
	readerMastodonKeys,
} from '@automattic/api-core';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
	CreateMastodonConnectionParams,
	MastodonConnectionDetails,
	MastodonConnectionsResponse,
	MastodonCreateConnectionResponse,
	MastodonError,
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

export function useCreateMastodonConnectionMutation() {
	const client = useQueryClient();
	return useMutation<
		MastodonCreateConnectionResponse,
		MastodonError,
		CreateMastodonConnectionParams
	>( {
		mutationFn: createMastodonConnection,
		onSuccess: () => {
			client.invalidateQueries( { queryKey: readerMastodonKeys.connections() } );
		},
	} );
}

export const mastodonConnectionQueryOptions = ( id: number | null ) =>
	queryOptions< MastodonConnectionDetails, MastodonError >( {
		queryKey: readerMastodonKeys.connection( id ),
		queryFn: () => {
			if ( id === null || id <= 0 ) {
				// Defensive guard — `enabled` below should prevent this from
				// ever running. Throw the error type the query is typed for.
				const err: MastodonError = {
					kind: 'unknown',
					cause: new Error( `getMastodonConnection called with invalid id: ${ id }` ),
				};
				throw err;
			}
			return getMastodonConnection( id );
		},
		enabled: id !== null && id > 0,
		staleTime: 60_000,
	} );

export function useMastodonConnectionQuery( id: number | null ) {
	return useQuery( mastodonConnectionQueryOptions( id ) );
}
