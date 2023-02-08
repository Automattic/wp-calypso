import { AnyAction } from 'redux';
import {
	JETPACK_BACKUP_RETENTION_UPDATE,
	JETPACK_BACKUP_RETENTION_UPDATE_ERROR,
	JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import { AppState } from 'calypso/types';

const updateBackupRetentionRequestStatus = ( state: AppState = null, { type }: AnyAction ) => {
	switch ( type ) {
		case JETPACK_BACKUP_RETENTION_UPDATE:
			return 'pending';

		case JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS:
			return 'success';

		case JETPACK_BACKUP_RETENTION_UPDATE_ERROR:
			return 'failed';
	}
	return state;
};

export default combineReducers( {
	updateBackupRetentionRequestStatus,
} );
