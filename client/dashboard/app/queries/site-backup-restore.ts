import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
	fetchSiteBackupRestoreProgress,
	initiateSiteBackupRestore,
	type RestoreConfig,
} from '../../data/site-backup-restore';
import { queryClient } from '../query-client';

/**
 * Fetch the restore progress for a site.
 * @param siteId - The ID of the site to fetch restore progress for.
 * @param restoreId - The ID of the restore to fetch progress for.
 * @returns A promise that resolves to the restore progress.
 */
export const siteBackupRestoreProgressQuery = ( siteId: number, restoreId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backup', 'restore', restoreId, 'progress' ],
		queryFn: () => fetchSiteBackupRestoreProgress( siteId, restoreId ),
	} );

/**
 * Initiate a site restore.
 * @param siteId - The ID of the site to initiate a restore for.
 * @returns A promise that resolves to the restore ID.
 */
export const siteBackupRestoreInitiateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( { timestamp, config }: { timestamp: string | number; config?: RestoreConfig } ) =>
			initiateSiteBackupRestore( siteId, timestamp, config ),
		onSuccess: ( restoreId ) => {
			// Start polling restore progress
			queryClient.prefetchQuery( siteBackupRestoreProgressQuery( siteId, restoreId ) );
		},
	} );
