import { wpcom } from '../wpcom-fetcher';
import type { DownloadConfig, DownloadStatusResponse } from './types';

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
