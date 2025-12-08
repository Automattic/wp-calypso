import {
	cancelSiteMigration,
	deleteSiteMigrationPendingStatus,
	fetchSiteMigrationKey,
	fetchSiteMigrationZendeskTicket,
	fetchSSHMigration,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';

export const siteMigrationKeyQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'migration', 'key' ],
		queryFn: () => fetchSiteMigrationKey( siteId ),
	} );

export const siteMigrationZendeskTicketQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'migration', 'zendesk', 'ticket' ],
		queryFn: () => fetchSiteMigrationZendeskTicket( siteId ),
	} );

export const sshMigrationQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'ssh-migration' ],
		queryFn: () => fetchSSHMigration( siteId ),
	} );

export const cancelSiteMigrationQuery = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => cancelSiteMigration( siteId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteMigrationZendeskTicketQuery( siteId ) );
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			queryClient.invalidateQueries( { queryKey: [ 'site', siteId ] } );
			queryClient.invalidateQueries( { queryKey: [ 'sites' ] } );
		},
	} );

export const deleteSiteMigrationPendingStatusQuery = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => deleteSiteMigrationPendingStatus( siteId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			queryClient.invalidateQueries( { queryKey: [ 'site', siteId ] } );
			queryClient.invalidateQueries( { queryKey: [ 'sites' ] } );
		},
	} );
