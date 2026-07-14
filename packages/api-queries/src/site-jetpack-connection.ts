import {
	disconnectJetpackSite,
	fetchJetpackConnection,
	fetchJetpackConnectionHealth,
	fetchJetpackTestConnection,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';

export const siteJetpackConnectionQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'jetpack_connection' ],
		queryFn: () => fetchJetpackConnection( siteId ),
	} );

export const jetpackConnectionHealthQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'jetpack-connection-health' ],
		queryFn: () => fetchJetpackConnectionHealth( siteId ),
	} );

export const jetpackTestConnectionQuery = ( siteId: number, isStaleConnectionHealthy: boolean ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'jetpack-test-connection', isStaleConnectionHealthy ],
		queryFn: () => fetchJetpackTestConnection( siteId, isStaleConnectionHealthy ),
	} );

export const siteJetpackDisconnectMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => disconnectJetpackSite( siteId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			queryClient.invalidateQueries( { queryKey: [ 'site', siteId ] } );
			queryClient.invalidateQueries( { queryKey: [ 'sites' ] } );
		},
	} );
