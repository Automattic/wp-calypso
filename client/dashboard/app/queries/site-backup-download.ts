import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
	fetchSiteBackupDownloadProgress,
	initiateSiteBackupDownload,
	type DownloadProgress,
	type DownloadConfig,
} from '../../data/site-backup-download';
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
		refetchInterval: ( query: { state: { data?: DownloadProgress } } ) => {
			const { data } = query.state;

			// Poll every 1.5 seconds if download is in progress
			if ( ! data?.url ) {
				return 1500;
			}

			// Stop polling if finished or failed
			return false;
		},
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
			config,
		}: {
			timestamp: string | number;
			config?: DownloadConfig;
		} ) => initiateSiteBackupDownload( siteId, timestamp, config ),
		onSuccess: ( downloadId ) => {
			// Start polling download progress
			queryClient.prefetchQuery( siteBackupDownloadProgressQuery( siteId, downloadId ) );
		},
	} );
