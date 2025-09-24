import { wpcom } from '../wpcom-fetcher';
import type {
	DownloadConfig,
	DownloadStatusResponse,
	PrepareBackupDownloadResponse,
} from './types';

/**
 * Initiate a download operation for a site backup at a specific timestamp.
 * @param siteId - The ID of the site to download backup for.
 * @param timestamp - Unix timestamp of the backup to download.
 * @param calypsoEnv - The environment ID of the Calypso instance.
 * @param downloadConfig - Download configuration specifying what to include.
 * @returns A promise that resolves to the download ID.
 */
export async function initiateSiteBackupDownload(
	siteId: number,
	timestamp: string | number,
	calypsoEnv: string,
	downloadConfig: DownloadConfig = {}
): Promise< number > {
	const data: DownloadStatusResponse = await wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/rewind/downloads`,
		body: {
			rewindId: timestamp,
			types: downloadConfig,
			calypso_env: calypsoEnv,
		},
	} );

	return data.downloadId;
}

/**
 * Prepare a filtered backup download.
 * @param siteId - The ID of the site to prepare download for.
 * @param rewindId - The backup/rewind ID to download from.
 * @param manifestFilter - The manifest filter specifying what to include.
 * @param dataType - The data type for the download.
 * @returns A promise that resolves to the prepare download response.
 */
export function prepareBackupDownload(
	siteId: number,
	rewindId: string,
	manifestFilter: string,
	dataType: number
): Promise< PrepareBackupDownloadResponse > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/rewind/backup/filtered/prepare`,
			apiNamespace: 'wpcom/v2',
		},
		{
			backup_id: rewindId,
			manifest_filter: manifestFilter,
			data_type: dataType,
		}
	);
}

/**
 * Initiate a granular backup download with specific paths to include/exclude.
 * @param siteId - The ID of the site to download backup for.
 * @param rewindId - The backup/rewind ID to download from.
 * @param includePaths - Comma-separated list of paths to include.
 * @param excludePaths - Comma-separated list of paths to exclude.
 * @returns A promise that resolves to the download ID.
 */
export async function initiateGranularBackupDownload(
	siteId: number,
	rewindId: string,
	includePaths: string,
	excludePaths: string = ''
): Promise< number > {
	const data: DownloadStatusResponse = await wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/rewind/downloads`,
		body: {
			rewindId,
			types: { paths: true },
			include_path_list: includePaths,
			exclude_path_list: excludePaths,
		},
	} );

	return data.downloadId;
}
