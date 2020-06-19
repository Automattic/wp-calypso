/**
 * External dependencies
 */
import { get } from 'lodash';

// Returns the rewindId os a in-progress download or null if no download is in progress.
export default function getBackupProgressRewindId( state, siteId ): string | null {
	const maybeProgress = get( state, [ 'activityLog', 'backupProgress', siteId ], null );
	return maybeProgress?.progress ? maybeProgress.rewindId : null;
}
