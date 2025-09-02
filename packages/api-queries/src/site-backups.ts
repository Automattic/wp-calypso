import {
	fetchSiteRewindableActivityLog,
	enqueueSiteBackup,
	fetchSiteBackups,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const siteLastBackupQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backups', 'last' ],
		queryFn: () => fetchSiteRewindableActivityLog( siteId, { number: 1 } ),
		select: ( data ) => data.current?.orderedItems[ 0 ] ?? null,
	} );

export const siteBackupsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backups' ],
		queryFn: () => fetchSiteBackups( siteId ),
	} );

export const siteBackupEnqueueMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => enqueueSiteBackup( siteId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteBackupsQuery( siteId ) );
		},
	} );
