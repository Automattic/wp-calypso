import { wpcom } from '../wpcom-fetcher';

/**
 * Enqueue a backup for a site.
 * @param siteId - The ID of the site to enqueue a backup for.
 * @returns A promise that resolves when the backup is enqueued.
 */
export async function enqueueSiteBackup( siteId: number ): Promise< void > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/rewind/backups/enqueue`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function updateRetentionDays(
	siteId: number,
	retentionDays: number
): Promise< void > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/backup/retention/update`,
		apiNamespace: 'wpcom/v2',
		body: { retention_days: retentionDays },
	} );
}
