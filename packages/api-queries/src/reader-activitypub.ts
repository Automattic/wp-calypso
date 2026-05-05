import {
	authorizeFediverseConnection,
	completeFediverseConnection,
	createFediverseNote,
	deleteFediverseConnection,
	enableFediverseC2s,
	enableFediverseFeature,
	enableFediverseUserActors,
	getFediverseConnection,
	getFediverseConnections,
	getFediverseSiteCapabilities,
	readerActivityPubKeys,
} from '@automattic/api-core';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
	AuthorizeFediverseConnectionParams,
	CompleteFediverseConnectionParams,
	CreateFediverseNoteParams,
	FediverseAuthorizeResponse,
	FediverseConnection,
	FediverseConnectionsResponse,
	FediverseEnableResponse,
	FediverseError,
	FediverseNote,
	FediverseSiteCapabilities,
} from '@automattic/api-core';

export const fediverseConnectionsQueryOptions = () =>
	queryOptions< FediverseConnectionsResponse, FediverseError >( {
		queryKey: readerActivityPubKeys.connections(),
		queryFn: getFediverseConnections,
		staleTime: 60_000,
	} );

export function useFediverseConnectionsQuery( { enabled }: { enabled?: boolean } = {} ) {
	return useQuery( { ...fediverseConnectionsQueryOptions(), enabled } );
}

export const fediverseConnectionQueryOptions = ( id: number | null ) =>
	queryOptions< FediverseConnection, FediverseError >( {
		queryKey: readerActivityPubKeys.connection( id ),
		queryFn: () => getFediverseConnection( id as number ),
		enabled: id !== null && id > 0,
		staleTime: 60_000,
	} );

export function useFediverseConnectionQuery( id: number | null ) {
	return useQuery( fediverseConnectionQueryOptions( id ) );
}

export const fediverseSiteCapabilitiesQueryOptions = ( blogId: number ) =>
	queryOptions< FediverseSiteCapabilities, FediverseError >( {
		queryKey: readerActivityPubKeys.capabilities( blogId ),
		queryFn: () => getFediverseSiteCapabilities( blogId ),
		enabled: blogId > 0,
		staleTime: 0,
	} );

export function useFediverseSiteCapabilitiesQuery( blogId: number ) {
	return useQuery( fediverseSiteCapabilitiesQueryOptions( blogId ) );
}

export function useAuthorizeFediverseConnectionMutation() {
	return useMutation<
		FediverseAuthorizeResponse,
		FediverseError,
		AuthorizeFediverseConnectionParams
	>( {
		mutationFn: authorizeFediverseConnection,
	} );
}

export function useCompleteFediverseConnectionMutation() {
	const client = useQueryClient();
	return useMutation<
		{ connection: FediverseConnection },
		FediverseError,
		CompleteFediverseConnectionParams
	>( {
		mutationFn: completeFediverseConnection,
		onSuccess: ( { connection } ) => {
			// Seed the list cache synchronously so the route we `page.replace`
			// to next can resolve the new connection without waiting for a
			// refetch. Without this, the account view reads the stale cached
			// list, can't find the new id, and redirects to the landing view.
			client.setQueryData< FediverseConnectionsResponse >(
				readerActivityPubKeys.connections(),
				( prev ) => {
					const existing = prev?.connections ?? [];
					if ( existing.some( ( c ) => c.id === connection.id ) ) {
						return prev;
					}
					return { connections: [ ...existing, connection ] };
				}
			);
			client.invalidateQueries( { queryKey: readerActivityPubKeys.connections() } );
		},
	} );
}

export function useEnableFediverseFeatureMutation( blogId: number ) {
	const client = useQueryClient();
	return useMutation< FediverseEnableResponse, FediverseError, void >( {
		mutationFn: () => enableFediverseFeature( blogId ),
		onSuccess: () => {
			client.invalidateQueries( { queryKey: readerActivityPubKeys.capabilities( blogId ) } );
		},
	} );
}

export function useEnableFediverseC2sMutation( blogId: number ) {
	const client = useQueryClient();
	return useMutation< FediverseEnableResponse, FediverseError, void >( {
		mutationFn: () => enableFediverseC2s( blogId ),
		onSuccess: () => {
			client.invalidateQueries( { queryKey: readerActivityPubKeys.capabilities( blogId ) } );
		},
	} );
}

export function useEnableFediverseUserActorsMutation( blogId: number ) {
	const client = useQueryClient();
	return useMutation< FediverseEnableResponse, FediverseError, void >( {
		mutationFn: () => enableFediverseUserActors( blogId ),
		onSuccess: () => {
			client.invalidateQueries( { queryKey: readerActivityPubKeys.capabilities( blogId ) } );
		},
	} );
}

export function useCreateFediverseNoteMutation( connectionId: number ) {
	return useMutation< FediverseNote, FediverseError, CreateFediverseNoteParams >( {
		mutationFn: ( params ) => createFediverseNote( { ...params, connectionId } ),
	} );
}

export function useDisconnectFediverseMutation( connectionId: number ) {
	const client = useQueryClient();
	return useMutation< void, FediverseError, void >( {
		mutationFn: () => deleteFediverseConnection( connectionId ),
		onSuccess: () => {
			client.invalidateQueries( { queryKey: readerActivityPubKeys.connections() } );
			client.removeQueries( { queryKey: readerActivityPubKeys.connection( connectionId ) } );
		},
	} );
}
