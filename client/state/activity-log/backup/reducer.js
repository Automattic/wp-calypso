/** @format */
/**
 * Internal dependencies
 */
import {
	REWIND_BACKUP,
	REWIND_BACKUP_DISMISS,
	REWIND_BACKUP_REQUEST,
	REWIND_BACKUP_DISMISS_PROGRESS,
	REWIND_BACKUP_UPDATE_PROGRESS,
} from 'state/action-types';
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
			console.warn( 'backupRequest' );
			return undefined;

		default:
			return state;
	}
} );

export const backupProgress = keyedReducer( 'siteId', ( state = undefined, action ) => {
	switch ( action.type ) {
		case REWIND_BACKUP:
			console.warn( 'backupProgress', action );
			return {
				backupPoint: '',
				downloadId: 0,
				progress: 0,
				rewindId: action.rewindId,
				startedAt: '',
			};

		case REWIND_BACKUP_UPDATE_PROGRESS:
			console.warn( 'backupUpdateProgress' );
			return {
				backupPoint: action.backupPoint,
				downloadId: action.downloadId,
				progress: action.progress,
				rewindId: action.rewindId,
				startedAt: action.startedAt,
			};

		case REWIND_BACKUP_DISMISS_PROGRESS:
			return null;

		default:
			return state;
	}
} );
