import {
	fetchSiteBackupDownloadProgress,
	initiateSiteBackupDownload,
	type DownloadConfig,
} from '@automattic/api-core';
import configApi from '@automattic/calypso-config';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from '../query-client';

/**
 * Fetch the download progress for a site backup.
 * @param siteId - The ID of the site to fetch download progress for.
 * @param downloadId - The ID of the download to fetch progress for.
 * @returns A promise that resolves to the download progress.
 */
export const siteBackupDownloadProgressQuery = ( siteId: number, downloadId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backup', 'download', downloadId, 'progress' ],
		queryFn: () => fetchSiteBackupDownloadProgress( siteId, downloadId ),
	} );

/**
 * Initiate a site backup download.
 * @param siteId - The ID of the site to initiate a download for.
 * @returns A promise that resolves to the download ID.
 */
export const siteBackupDownloadInitiateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( {
			timestamp,
			config: downloadConfig,
		}: {
			timestamp: string | number;
			config?: DownloadConfig;
		} ) => initiateSiteBackupDownload( siteId, timestamp, configApi( 'env_id' ), downloadConfig ),
		onSuccess: ( downloadId ) => {
			// Start polling download progress
			queryClient.prefetchQuery( siteBackupDownloadProgressQuery( siteId, downloadId ) );
		},
	} );
