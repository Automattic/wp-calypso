import config from '@automattic/calypso-config';
import wpcom from 'calypso/lib/wp';

/**
 * Download configuration options.
 */
export interface DownloadConfig {
	themes?: boolean;
	plugins?: boolean;
	roots?: boolean;
	contents?: boolean;
	sqls?: boolean;
	uploads?: boolean;
}

/**
 * Download error information.
 */
export interface DownloadError {
	code: string;
	message: string;
}

/**
 * Download progress information.
 */
export interface DownloadProgress {
	download_id: number;
	rewind_id: string;
	backup_point: string;
	started_at: string;
	progress: number;
	download_count: number;
	valid_until: string;
	url: string;
	bytes: number;
	bytes_formatted: string;
	error?: DownloadError;
}

/**
 * Download status response from the API.
 */
interface DownloadStatusResponse {
	downloadId: number;
	rewindId: string;
	backupPoint: string;
	startedAt: string;
	progress: number;
	downloadCount: number;
	validUntil: string;
	url: string;
	bytes: number;
	bytesFormatted: string;
	// Error fields
	code: string;
	message: string;
}

/**
 * Initiate a download operation for a site backup at a specific timestamp.
 * @param siteId - The ID of the site to download backup for.
 * @param timestamp - Unix timestamp of the backup to download.
 * @param downloadConfig - Download configuration specifying what to include.
 * @returns A promise that resolves to the download ID.
 */
export async function initiateSiteBackupDownload(
	siteId: number,
	timestamp: string | number,
	downloadConfig: DownloadConfig = {}
): Promise< number > {
	const data: DownloadStatusResponse = await wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/rewind/downloads`,
		body: {
			rewindId: timestamp,
			types: downloadConfig,
			calypso_env: config( 'env_id' ),
		},
	} );

	return data.downloadId;
}

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
