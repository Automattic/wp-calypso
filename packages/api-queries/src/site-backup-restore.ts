import {
	fetchSiteBackupRestoreProgress,
	initiateSiteBackupRestore,
	initiateSiteGranularRestore,
	type RestoreConfig,
	type GranularRestoreConfig,
} from '@automattic/api-core';
import configApi from '@automattic/calypso-config';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

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
		meta: { statId: 'site-backup-restore-init' },
		mutationFn: ( {
			timestamp,
			config: restoreConfig,
			acknowledgeThreats,
		}: {
			timestamp: string | number;
			config?: RestoreConfig;
			acknowledgeThreats?: boolean;
		} ) =>
			initiateSiteBackupRestore(
				siteId,
				timestamp,
				configApi( 'env_id' ),
				restoreConfig,
				acknowledgeThreats
			),
		onSuccess: ( restoreId ) => {
			// Start polling restore progress
			queryClient.prefetchQuery( siteBackupRestoreProgressQuery( siteId, restoreId ) );
		},
	} );

/**
 * Initiate a granular site restore.
 * @param siteId - The ID of the site to initiate a granular restore for.
 * @returns A promise that resolves to the restore ID.
 */
export const siteBackupGranularRestoreMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-backup-gran-restore' },
		mutationFn: ( {
			timestamp,
			config: granularConfig,
			acknowledgeThreats,
		}: {
			timestamp: string | number;
			config: GranularRestoreConfig;
			acknowledgeThreats?: boolean;
		} ) =>
			initiateSiteGranularRestore(
				siteId,
				timestamp,
				configApi( 'env_id' ),
				granularConfig,
				acknowledgeThreats
			),
		onSuccess: ( restoreId ) => {
			// Start polling restore progress
			queryClient.prefetchQuery( siteBackupRestoreProgressQuery( siteId, restoreId ) );
		},
	} );
