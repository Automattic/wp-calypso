import {
	JETPACK_BACKUP_RETENTION_UPDATE,
	JETPACK_BACKUP_RETENTION_UPDATE_ERROR,
	JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS,
} from 'calypso/state/action-types';
import { BACKUP_RETENTION_UPDATE_REQUEST } from './constants';
import type { AppState } from 'calypso/types';
import type { AnyAction } from 'redux';

const initialState = {
	updateRequestStatus: BACKUP_RETENTION_UPDATE_REQUEST.UNSUBMITTED,
};

const retention = ( state: AppState = initialState, { type }: AnyAction ) => {
	switch ( type ) {
		case JETPACK_BACKUP_RETENTION_UPDATE:
			return { updateRequestStatus: BACKUP_RETENTION_UPDATE_REQUEST.PENDING };

		case JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS:
			return { updateRequestStatus: BACKUP_RETENTION_UPDATE_REQUEST.SUCCESS };

		case JETPACK_BACKUP_RETENTION_UPDATE_ERROR:
			return { updateRequestStatus: BACKUP_RETENTION_UPDATE_REQUEST.FAILED };
	}
	return state;
};

export default retention;
