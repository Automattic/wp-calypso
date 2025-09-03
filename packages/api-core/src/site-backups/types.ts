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
	discarded?: string;
	is_backup: string;
	is_scan: string;
}
