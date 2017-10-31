/** @format */
/**
 * Internal dependencies
 */
import { REWIND_BACKUP, REWIND_BACKUP_DISMISS, REWIND_BACKUP_REQUEST } from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const backupRequest = keyedReducer( 'siteId', ( state = undefined, { type, rewindId } ) => {
	switch ( type ) {
		// Show confirmation dialog
		case REWIND_BACKUP_REQUEST:
			return rewindId;

		// Dismiss confirmation dialog
		case REWIND_BACKUP_DISMISS:
		// Start backup
		case REWIND_BACKUP:
			console.warn( 'backupRequst' );
			return undefined;

		default:
			return state;
	}
} );

const startBackupProgress = ( state, { rewindId } ) => ( {
	errorCode: '',
	failureReason: '',
	freshness: -Infinity,
	message: '',
	percent: 0,
	status: 'queued',
	rewindId,
} );

export const backupProgress = keyedReducer( 'siteId', ( state = undefined, { type, rewindId } ) => {
	switch ( type ) {
		case REWIND_BACKUP:
			console.warn( 'backupProgress' );
			return startBackupProgress( state, rewindId );

		default:
			return state;
	}
} );
