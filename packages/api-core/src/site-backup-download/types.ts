/**
 * Download configuration options.
 */
export interface DownloadConfig {
	themes?: boolean;
	plugins?: boolean;
	roots?: boolean;
	contents?: boolean;
	sqls?: boolean;
	uploads?: boolean;
}

/**
 * Download error information.
 */
export interface DownloadError {
	code: string;
	message: string;
}

/**
 * Download progress information.
 */
export interface DownloadProgress {
	download_id: number;
	rewind_id: string;
	backup_point: string;
	started_at: string;
	progress: number;
	download_count: number;
	valid_until: string;
	url: string;
	bytes: number;
	bytes_formatted: string;
	error?: DownloadError;
}

/**
 * Download status response from the API.
 */
export interface DownloadStatusResponse {
	downloadId: number;
	rewindId: string;
	backupPoint: string;
	startedAt: string;
	progress: number;
	downloadCount: number;
	validUntil: string;
	url: string;
	bytes: number;
	bytesFormatted: string;
	// Error fields
	code: string;
	message: string;
}
