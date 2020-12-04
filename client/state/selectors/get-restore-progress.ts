/**
 * Internal dependencies
 */

/**
 * Type dependencies
 */
import { AppState } from 'calypso/types';
import type { RestoreProgress } from 'calypso/state/data-layer/wpcom/activity-log/rewind/restore-status/type';

/**
 * Get the progress details of a restore for a specified site
 *
 * @param {AppState} state Global state tree
 * @param {number | string} siteId the site ID
 * @returns {RestoreProgress} Progress details
 */
export default function getRestoreProgress(
	state: AppState,
	siteId: number | string
): RestoreProgress | undefined {
	return state.activityLog?.restoreProgress?.[ siteId ];
}
