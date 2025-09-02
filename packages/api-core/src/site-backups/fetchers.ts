import { wpcom } from '../wpcom-fetcher';
import type { BackupEntry } from './types';

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
