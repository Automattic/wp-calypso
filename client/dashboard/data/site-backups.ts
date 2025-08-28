import wpcom from 'calypso/lib/wp';

export const BackupEntryErrorStatuses = {
	BACKUPS_DEACTIVATED: 'backups-deactivated',
	CREDENTIAL_ERROR: 'credential-error',
	ERROR_WILL_RETRY: 'error-will-retry',
	ERROR: 'error',
	HTTP_ONLY_ERROR: 'http-only-error',
	NO_CREDENTIALS_ATOMIC: 'no-credentials-atomic',
	NOT_ACCESSIBLE: 'not-accessible',
} as const;

export const BackupEntryStatuses = {
	STARTED: 'started',
	FINISHED: 'finished',
	...BackupEntryErrorStatuses,
} as const;

export type BackupEntryStatus = ( typeof BackupEntryStatuses )[ keyof typeof BackupEntryStatuses ];
export interface BackupEntry {
	id: string;
	started: string;
	last_updated: string;
	status: BackupEntryStatus;
	period: string;
	percent: string;
	discarded: string;
	is_backup: string;
	is_scan: string;
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
