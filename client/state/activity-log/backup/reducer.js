/**
 * Internal dependencies
 */
import {
	REWIND_BACKUP,
	REWIND_BACKUP_DISMISS,
	REWIND_BACKUP_REQUEST,
	REWIND_BACKUP_DISMISS_PROGRESS,
	REWIND_BACKUP_UPDATE_PROGRESS,
	REWIND_BACKUP_UPDATE_ERROR,
} from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

export const backupRequest = keyedReducer( 'siteId', ( state = undefined, { type, rewindId } ) => {
	switch ( type ) {
		// Show confirmation dialog
		case REWIND_BACKUP_REQUEST:
			return rewindId;

		// Dismiss confirmation dialog
		case REWIND_BACKUP_DISMISS:
		// Start backup
		case REWIND_BACKUP:
			return undefined;

		default:
			return state;
	}
} );

export const backupProgress = keyedReducer( 'siteId', ( state = undefined, action ) => {
	switch ( action.type ) {
		case REWIND_BACKUP:
			return {
				backupPoint: '',
				downloadId: 0,
				progress: 0,
				rewindId: action.rewindId,
				startedAt: '',
				downloadCount: 0,
				validUntil: '',
				url: '',
			};

		case REWIND_BACKUP_UPDATE_PROGRESS:
			return ! action.rewindId
				? null
				: {
						backupPoint: action.backupPoint,
						downloadId: action.downloadId,
						progress: action.progress,
						rewindId: action.rewindId,
						startedAt: action.startedAt,
						downloadCount: action.downloadCount,
						validUntil: action.validUntil,
						url: action.url,
				  };

		case REWIND_BACKUP_UPDATE_ERROR:
			return {
				backupPoint: action.backupPoint,
				downloadId: action.downloadId,
				backupError: action.error,
				rewindId: action.rewindId,
				startedAt: action.startedAt,
			};

		case REWIND_BACKUP_DISMISS_PROGRESS:
		case REWIND_BACKUP_DISMISS:
			return null;

		default:
			return state;
	}
} );
