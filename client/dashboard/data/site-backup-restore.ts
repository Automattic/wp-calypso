import config from '@automattic/calypso-config';
import wpcom from 'calypso/lib/wp';

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
interface RestoreStatusResponse {
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

/**
 * Initiate a restore operation for a site to a specific timestamp.
 * @param siteId - The ID of the site to restore.
 * @param timestamp - Unix timestamp to restore site to.
 * @param restoreConfig - Restore configuration specifying what to restore.
 * @returns A promise that resolves to the restore ID.
 */
export async function initiateSiteBackupRestore(
	siteId: number,
	timestamp: string | number,
	restoreConfig: RestoreConfig = {}
): Promise< number > {
	const data: { restore_id: string } = await wpcom.req.post( {
		apiVersion: '1',
		path: `/activity-log/${ siteId }/rewind/to/${ timestamp }`,
		body: {
			types: restoreConfig,
			calypso_env: config( 'env_id' ),
			force_rewind: true,
		},
	} );

	return Number( data.restore_id );
}

/**
 * Fetch the progress of a restore operation.
 * @param siteId - The ID of the site.
 * @param restoreId - The ID of the restore operation.
 * @returns A promise that resolves to the restore progress.
 */
export async function fetchSiteBackupRestoreProgress(
	siteId: number,
	restoreId: number
): Promise< RestoreProgress > {
	const data: RestoreStatusResponse = await wpcom.req.get( {
		apiVersion: '1',
		path: `/activity-log/${ siteId }/rewind/${ restoreId }/restore-status`,
	} );

	const {
		percent = 0,
		status = '',
		rewind_id = '',
		is_dismissed = false,
		context = '',
		message = '',
		current_entry = null,
		error_code = '',
		failure_reason = '',
	} = data.restore_status || {};

	return {
		percent,
		status,
		rewindId: rewind_id,
		isDismissed: is_dismissed,
		context,
		message,
		currentEntry: current_entry,
		errorCode: error_code,
		failureReason: failure_reason,
	};
}
