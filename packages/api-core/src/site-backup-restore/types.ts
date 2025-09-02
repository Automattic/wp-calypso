export type RestoreStatus = 'queued' | 'running' | 'finished' | 'fail' | '';

/**
 * Restore configuration options.
 */
export interface RestoreConfig {
	themes?: boolean;
	plugins?: boolean;
	sqls?: boolean;
	roots?: boolean;
	contents?: boolean;
	uploads?: boolean;
}

/**
 * Restore progress information.
 */
export interface RestoreProgress {
	percent: number;
	status: RestoreStatus;
	rewindId: string;
	isDismissed: boolean;
	context: string;
	message: string;
	currentEntry: string | null;
	errorCode: string;
	failureReason: string;
}

/**
 * Restore status response from the API.
 */
export interface RestoreStatusResponse {
	ok: boolean;
	error: string;
	restore_status: {
		percent: number;
		status: RestoreStatus;
		rewind_id: string;
		is_dismissed: boolean;
		context: string;
		message: string;
		current_entry: string | null;
		error_code: string;
		failure_reason: string;
	};
}
