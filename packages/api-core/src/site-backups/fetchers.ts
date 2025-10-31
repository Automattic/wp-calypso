import { wpcom } from '../wpcom-fetcher';
import type {
	BackupEntry,
	BackupContentsResponse,
	BackupPathInfoResponse,
	BackupItemUrl,
	SiteRewindPoliciesResponse,
	SiteRewindSizeResponse,
} from './types';

/**
 * Fetch the list of backups for a site.
 * @param siteId - The ID of the site to fetch backups for.
 * @returns A promise that resolves to the list of backups.
 */
export function fetchSiteBackups( siteId: number ): Promise< BackupEntry[] > {
	return wpcom.req.get( `/sites/${ siteId }/rewind/backups`, {
		apiNamespace: 'wpcom/v2',
	} );
}

/**
 * Fetch backup contents (file/directory listing) for a site backup.
 * @param siteId - The ID of the site to fetch backup contents for.
 * @param rewindId - The backup/rewind ID to fetch contents from.
 * @param path - The path within the backup to list contents for.
 * @returns A promise that resolves to the backup contents data.
 */
export function fetchBackupContents(
	siteId: number,
	rewindId: number,
	path: string
): Promise< BackupContentsResponse > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/rewind/backup/ls`,
			apiNamespace: 'wpcom/v2',
		},
		{
			backup_id: rewindId,
			path: path,
		}
	);
}

/**
 * Fetch backup path info (file metadata) for a specific path in a backup.
 * @param siteId - The ID of the site to fetch backup path info for.
 * @param rewindId - The backup/rewind ID to fetch path info from.
 * @param manifestPath - The manifest path to get info for.
 * @param extensionType - Optional extension type filter.
 * @returns A promise that resolves to the backup path info data.
 */
export function fetchBackupPathInfo(
	siteId: number,
	rewindId: string,
	manifestPath: string,
	extensionType = ''
): Promise< BackupPathInfoResponse > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/rewind/backup/path-info`,
			apiNamespace: 'wpcom/v2',
		},
		{
			backup_id: rewindId,
			manifest_path: manifestPath,
			extension_type: extensionType,
		}
	);
}

/**
 * Fetch backup file URL for a specific file in a backup.
 * @param siteId - The ID of the site to fetch backup file for.
 * @param rewindId - The backup/rewind ID to fetch file from.
 * @param encodedManifestPath - The base64 encoded manifest path.
 * @returns A promise that resolves to the backup file URL data.
 */
export function fetchBackupFileUrl(
	siteId: number,
	rewindId: string,
	encodedManifestPath: string
): Promise< BackupItemUrl > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/rewind/backup/${ rewindId }/file/${ encodedManifestPath }/url`,
		apiNamespace: 'wpcom/v2',
	} );
}

export function fetchBackupExtensionUrl(
	siteId: number,
	period: string,
	archiveType: string,
	extensionSlug: string,
	extensionVersion: string
): Promise< BackupItemUrl > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/rewind/backup/${ period }/extension/${ archiveType }/url`,
			apiNamespace: 'wpcom/v2',
		},
		{
			extension_slug: extensionSlug,
			extension_version: extensionVersion,
		}
	);
}

export async function fetchBackupPolicies( siteId: number ): Promise< SiteRewindPoliciesResponse > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/rewind/policies`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchBackupSize( siteId: number ): Promise< SiteRewindSizeResponse > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/rewind/size`,
		apiNamespace: 'wpcom/v2',
	} );
}
