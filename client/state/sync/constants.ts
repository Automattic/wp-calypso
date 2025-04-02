export enum SiteSyncStatus {
	PENDING = 'pending',
	BACKUP = 'backing_up',
	RESTORE = 'restoring',
	COMPLETED = 'completed',
	FAILED = 'failed',
	ALLOW_RETRY = 'allow_retry',
}

export enum SiteSyncStatusProgress {
	PENDING = 0.2,
	BACKUP = 0.3,
	RESTORE = 0.6,
	COMPLETED = 1,
	FAILED = 0,
	ALLOW_RETRY = 0.1,
}
