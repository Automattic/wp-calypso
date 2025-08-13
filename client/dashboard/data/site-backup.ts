import wpcom from 'calypso/lib/wp';

export interface BackupEntry {
	id: string;
	started: string;
	last_updated: string;
	status:
		| 'not_started'
		| 'queued'
		| 'started'
		| 'finished'
		| 'error'
		| 'error_will_retry'
		| 'not-accessible'
		| 'backups-deactivated';
	period: string;
	percent: string;
	discarded: string;
	is_backup: string;
	is_scan: string;
}

/**
 * Enqueue a backup for a site.
 * @param siteId - The ID of the site to enqueue a backup for.
 * @returns A promise that resolves when the backup is enqueued.
 */
export function enqueueSiteBackup( siteId: number ): Promise< void > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/rewind/backups/enqueue`,
			apiNamespace: 'wpcom/v2',
		},
		{}
	);
}

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
