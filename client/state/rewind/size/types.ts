export type RewindSizeInfo = {
	bytesUsed: number;
	minDaysOfBackupsAllowed: number;
	daysOfBackupsAllowed: number;
	daysOfBackupsSaved: number;
	lastBackupSize: number;
	retentionDays: number;
	backupsStopped: boolean;
	lastBackupFailed: boolean;
};
