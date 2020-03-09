export interface BackupProgress {
	backupPoint: string;
	downloadId: number;
	progress: number;
	rewindId: string;
	startedAt: string;
	downloadCount: number;
	validUntil?: string;
	url?: string;
	error?: string;
}
