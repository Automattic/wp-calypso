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
