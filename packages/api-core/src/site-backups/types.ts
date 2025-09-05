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

export interface BackupFileUrl {
	url: string;
}
