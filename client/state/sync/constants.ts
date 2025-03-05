export enum SiteSyncStatus {
	PENDING = 'pending',
	BACKUP = 'backing_up',
	RESTORE = 'restoring',
	COMPLETED = 'completed',
	FAILED = 'failed',
	ALLOW_RETRY = 'allow_retry',
}

export enum SiteSyncStatusProgress {
	PENDING = 20,
	BACKUP = 30,
	RESTORE = 60,
	COMPLETED = 100,
	FAILED = 0,
	ALLOW_RETRY = 10,
	DELTA = 0.4,
}
