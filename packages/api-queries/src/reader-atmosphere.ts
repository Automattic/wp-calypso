import {
	createConnection,
	getConnections,
	readerAtmosphereKeys,
	verifyConnection,
} from '@automattic/api-core';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
	AtmosphereConnectionsResponse,
	AtmosphereCreateConnectionResponse,
	AtmosphereError,
	AtmosphereVerifyResult,
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

export const verifyConnectionQueryOptions = ( id: number | null ) =>
	queryOptions< AtmosphereVerifyResult, AtmosphereError >( {
		queryKey: readerAtmosphereKeys.verify( id ),
		queryFn: () => {
			if ( id === null || id <= 0 ) {
				// Defensive guard — `enabled` below should prevent this from
				// ever running. Throw the error type the query is typed for.
				const err: AtmosphereError = {
					kind: 'unknown',
					cause: new Error( `verifyConnection called with invalid id: ${ id }` ),
				};
				throw err;
			}
			return verifyConnection( id );
		},
		enabled: id !== null && id > 0,
		staleTime: 0,
	} );

export function useVerifyConnectionQuery( id: number | null ) {
	return useQuery( verifyConnectionQueryOptions( id ) );
}
