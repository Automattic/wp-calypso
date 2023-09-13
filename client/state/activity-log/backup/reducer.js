import {
	REWIND_BACKUP,
	REWIND_BACKUP_DISMISS,
	REWIND_BACKUP_REQUEST,
	REWIND_BACKUP_SET_DOWNLOAD_ID,
	REWIND_BACKUP_DISMISS_PROGRESS,
	REWIND_BACKUP_UPDATE_PROGRESS,
	REWIND_BACKUP_UPDATE_ERROR,
	REWIND_GRANULAR_BACKUP_REQUEST,
} from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

export const backupRequest = keyedReducer( 'siteId', ( state = undefined, action ) => {
	switch ( action.type ) {
		// Show confirmation dialog
		case REWIND_BACKUP_REQUEST:
			return action.rewindId;

		// Dismiss confirmation dialog
		case REWIND_BACKUP_DISMISS:
		// Start backup
		case REWIND_BACKUP:
			return undefined;

		case REWIND_BACKUP_SET_DOWNLOAD_ID:
			return action.downloadId;

		default:
			return state;
	}
} );

/**
 * Whether a backup granular download has been requested
 */
export const granularBackupDownloadRequested = keyedReducer(
	'siteId',
	( state = false, action ) => {
		switch ( action.type ) {
			case REWIND_GRANULAR_BACKUP_REQUEST:
				return true;
			case REWIND_BACKUP:
				return false;
		}

		return state;
	}
);

export const backupProgress = keyedReducer( 'siteId', ( state = undefined, action ) => {
	switch ( action.type ) {
		case REWIND_BACKUP:
		case REWIND_GRANULAR_BACKUP_REQUEST:
			return {
				backupPoint: '',
				downloadId: 0,
				progress: 0,
				rewindId: action.rewindId,
				startedAt: '',
				downloadCount: 0,
				validUntil: '',
				bytesFormatted: '',
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
						bytesFormatted: action.bytesFormatted,
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
