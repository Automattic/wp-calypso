import {
	JETPACK_BACKUP_RETENTION_UPDATE,
	JETPACK_BACKUP_RETENTION_UPDATE_ERROR,
	JETPACK_BACKUP_RETENTION_UPDATE_RESET,
	JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS,
} from 'calypso/state/action-types';
import { BACKUP_RETENTION_UPDATE_REQUEST } from './constants';
import type { AppState } from 'calypso/types';
import type { AnyAction } from 'redux';

const initialState: AppState = {
	requestStatus: BACKUP_RETENTION_UPDATE_REQUEST.UNSUBMITTED,
};

export const updateBackupRetentionRequestStatus = ( state = initialState, { type }: AnyAction ) => {
	switch ( type ) {
		case JETPACK_BACKUP_RETENTION_UPDATE:
			return {
				...state,
				requestStatus: BACKUP_RETENTION_UPDATE_REQUEST.PENDING,
			};

		case JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS:
			return {
				...state,
				requestStatus: BACKUP_RETENTION_UPDATE_REQUEST.SUCCESS,
			};

		case JETPACK_BACKUP_RETENTION_UPDATE_ERROR:
			return {
				...state,
				requestStatus: BACKUP_RETENTION_UPDATE_REQUEST.FAILED,
			};

		case JETPACK_BACKUP_RETENTION_UPDATE_RESET:
			return initialState;
	}
	return state;
};

export default updateBackupRetentionRequestStatus;
