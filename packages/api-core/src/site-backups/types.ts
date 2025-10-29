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

export interface BackupContentsResponse {
	ok: boolean;
	error: string;
	contents: {
		[ key: string ]: {
			id?: string;
			type: 'file' | 'dir' | 'wordpress' | 'table' | 'theme' | 'plugin' | 'archive';
			has_children: boolean;
			period?: string;
			sort?: number;
			manifest_path?: string;
			label?: string;
			row_count?: number;
			extension_version?: string;
			total_items?: number;
		};
	};
}

export interface BackupPathInfoResponse {
	download_url?: string;
	mtime?: number;
	size?: number;
	hash?: string;
	data_type?: number;
	manifest_filter?: string;
	error?: string;
}

export interface BackupItemUrl {
	url: string;
}

export interface BackupPolicy {
	/** Number of days activity logs are retained */
	activity_log_limit_days: number;

	/** Storage limit in bytes */
	storage_limit_bytes: number;
}

/**
 * Response from GET /sites/%s/rewind/policies
 * Returns the rewind policies for a site based on its products
 */
export interface SiteRewindPoliciesResponse {
	/**
	 * Rewind policy for the site, or null if no policy applies
	 * (e.g., agency sites or sites without backup products)
	 */
	policies: BackupPolicy | null;
}

export interface SiteRewindSizeResponse {
	/** Indicates successful response */
	ok: true;

	/** Empty string on success */
	error: '';

	/** Total estimated site size in bytes */
	size: number;

	/** Number of days of backups currently saved */
	days_of_backups_saved: number;

	/** Number of days of backups allowed by the plan */
	days_of_backups_allowed: number;

	/** Minimum number of days of backups allowed */
	min_days_of_backups_allowed: number;

	/** Size of the last backup in bytes */
	last_backup_size: number;

	/** Timestamp when last backup failed, or false if no recent failure */
	last_backup_failed: string | false;

	/** Number of days backups are retained */
	retention_days: number;

	/** Whether backups have been stopped */
	backups_stopped: boolean;
}
