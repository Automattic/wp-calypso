import { wpcom } from '../wpcom-fetcher';
import type {
	DownloadProgress,
	DownloadStatusResponse,
	BackupDownloadStatusResponse,
} from './types';

/**
 * Fetch the progress of a download operation.
 * @param siteId - The ID of the site.
 * @param downloadReqId - The ID of the download operation.
 * @returns A promise that resolves to the download progress.
 */
export async function fetchSiteBackupDownloadProgress(
	siteId: number,
	downloadReqId: number
): Promise< DownloadProgress > {
	const data: DownloadStatusResponse = await wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/rewind/downloads/${ downloadReqId }`,
	} );

	const {
		downloadId = 0,
		rewindId = '',
		backupPoint = '',
		startedAt = '',
		progress = 0,
		downloadCount = 0,
		validUntil = '',
		url = '',
		bytes = 0,
		bytesFormatted = '',
		code = '',
		message = '',
	} = data || {};

	return {
		download_id: downloadId,
		rewind_id: rewindId,
		backup_point: backupPoint,
		started_at: startedAt,
		progress,
		download_count: downloadCount,
		valid_until: validUntil,
		url,
		bytes,
		bytes_formatted: bytesFormatted,
		error: code ? { code, message } : undefined,
	};
}

/**
 * Get status of a filtered backup download preparation.
 * @param siteId - The ID of the site to check download status for.
 * @param buildKey - The build key from prepare download response.
 * @param dataType - The data type for the download.
 * @returns A promise that resolves to the download status.
 */
export function getBackupDownloadStatus(
	siteId: number,
	buildKey: string,
	dataType: number
): Promise< BackupDownloadStatusResponse > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/rewind/backup/filtered/status`,
			apiNamespace: 'wpcom/v2',
		},
		{
			data_type: dataType,
			key: buildKey,
		}
	);
}
