import { wpcom } from '../wpcom-fetcher';
import type { RestoreProgress, RestoreStatusResponse } from './types';

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
