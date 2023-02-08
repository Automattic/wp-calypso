import { AnyAction } from 'redux';
import {
	REWIND_BACKUP_RETENTION_UPDATE,
	REWIND_BACKUP_RETENTION_UPDATE_ERROR,
	REWIND_BACKUP_RETENTION_UPDATE_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import { AppState } from 'calypso/types';

const updateBackupRetentionRequestStatus = ( state: AppState = null, { type }: AnyAction ) => {
	switch ( type ) {
		case REWIND_BACKUP_RETENTION_UPDATE:
			return 'pending';

		case REWIND_BACKUP_RETENTION_UPDATE_SUCCESS:
			return 'success';

		case REWIND_BACKUP_RETENTION_UPDATE_ERROR:
			return 'failed';
	}
	return state;
};

export default combineReducers( {
	updateBackupRetentionRequestStatus,
} );
