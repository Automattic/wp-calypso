import {
	fetchSiteBackupRestoreProgress,
	initiateSiteBackupRestore,
	initiateSiteGranularRestore,
	dismissSiteRestore,
	type RestoreConfig,
	type GranularRestoreConfig,
} from '@automattic/api-core';
import configApi from '@automattic/calypso-config';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteRewindStateQuery } from './site-rewind';

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
		mutationFn: ( {
			timestamp,
			config: restoreConfig,
		}: {
			timestamp: string | number;
			config?: RestoreConfig;
		} ) => initiateSiteBackupRestore( siteId, timestamp, configApi( 'env_id' ), restoreConfig ),
		onSuccess: ( restoreId ) => {
			// Start polling restore progress
			queryClient.prefetchQuery( siteBackupRestoreProgressQuery( siteId, restoreId ) );
			// Invalidate rewind state to pick up new restore
			queryClient.invalidateQueries( siteRewindStateQuery( siteId ) );
		},
	} );

/**
 * Initiate a granular site restore.
 * @param siteId - The ID of the site to initiate a granular restore for.
 * @returns A promise that resolves to the restore ID.
 */
export const siteBackupGranularRestoreMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( {
			timestamp,
			config: granularConfig,
		}: {
			timestamp: string | number;
			config: GranularRestoreConfig;
		} ) => initiateSiteGranularRestore( siteId, timestamp, configApi( 'env_id' ), granularConfig ),
		onSuccess: ( restoreId ) => {
			// Start polling restore progress
			queryClient.prefetchQuery( siteBackupRestoreProgressQuery( siteId, restoreId ) );
			// Invalidate rewind state to pick up new restore
			queryClient.invalidateQueries( siteRewindStateQuery( siteId ) );
		},
	} );

/**
 * Dismiss a restore operation notice.
 * @param siteId - The ID of the site.
 * @returns Mutation options for dismissing a restore.
 */
export const dismissSiteRestoreMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( restoreId: number ) => dismissSiteRestore( siteId, restoreId ),
		onSuccess: () => {
			// Invalidate to refetch without the dismissed restore
			queryClient.invalidateQueries( siteRewindStateQuery( siteId ) );
		},
	} );
