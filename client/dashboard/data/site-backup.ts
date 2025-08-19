import wpcom from 'calypso/lib/wp';

/**
 * Enqueue a backup for a site.
 * @param siteId - The ID of the site to enqueue a backup for.
 * @returns A promise that resolves when the backup is enqueued.
 */
export function enqueueSiteBackup( siteId: number ): Promise< void > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/rewind/backups/enqueue`,
		apiNamespace: 'wpcom/v2',
	} );
}
