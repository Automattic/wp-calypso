import {
	createConnection,
	getConnections,
	readerAtmosphereKeys,
	verifyConnection,
} from '@automattic/api-core';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const connectionsQueryOptions = () =>
	queryOptions( {
		queryKey: readerAtmosphereKeys.connections(),
		queryFn: getConnections,
		staleTime: 60_000,
	} );

export function useConnectionsQuery() {
	return useQuery( connectionsQueryOptions() );
}

export function useCreateConnectionMutation() {
	const client = useQueryClient();
	return useMutation( {
		mutationFn: createConnection,
		onSuccess: () => {
			client.invalidateQueries( { queryKey: readerAtmosphereKeys.connections() } );
		},
	} );
}

export const verifyConnectionQueryOptions = ( id: number | null ) =>
	queryOptions( {
		queryKey: readerAtmosphereKeys.verify( id ?? 0 ),
		queryFn: () => verifyConnection( id as number ),
		enabled: id !== null && id > 0,
		staleTime: 0,
	} );

export function useVerifyConnectionQuery( id: number | null ) {
	return useQuery( verifyConnectionQueryOptions( id ) );
}
