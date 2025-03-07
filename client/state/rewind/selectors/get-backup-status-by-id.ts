import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import { AppState } from 'calypso/types';

/**
 * Returns comprehensive status information for a backup with the specified ID.
 * @param {Object} state - Global state tree
 * @param {number} siteId - The site ID
 * @param {number} id - The backup ID to check
 * @returns {Object|null} Backup status object or null if backup not found
 */
const getBackupStatusById = ( state: AppState, siteId: number, id: number ): object | null => {
	const allBackups = getRewindBackups( state, siteId );
	const backup = allBackups?.find( ( b ) => b.id === id );

	if ( ! backup ) {
		return null;
	}

	return {
		// Is this backup currently in progress?
		isInProgress: backup?.status === 'started',

		// Has this backup finished successfully?
		isFinished: backup?.status === 'finished',

		// Has this backup failed? (any status other than started/finished)
		hasFailed: backup?.status !== 'started' && backup?.status !== 'finished',

		// The current status of the backup
		status: backup?.status,

		// The full backup object
		backup: backup,
	};
};

export default getBackupStatusById;
