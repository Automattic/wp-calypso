import { AnyAction } from 'redux';
import {
	JETPACK_BACKUP_RETENTION_SET,
	REWIND_SIZE_REQUEST,
	REWIND_SIZE_REQUEST_FAILURE,
	REWIND_SIZE_REQUEST_SUCCESS,
	REWIND_SIZE_SET,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import { AppState } from 'calypso/types';

const requestStatus = ( state: AppState = null, { type }: AnyAction ): AppState | string => {
	switch ( type ) {
		case REWIND_SIZE_REQUEST:
			return 'pending';
		case REWIND_SIZE_REQUEST_FAILURE:
			return 'failure';
		case REWIND_SIZE_REQUEST_SUCCESS:
			return 'success';
	}

	return state;
};

const bytesUsed = (
	state: AppState = null,
	{ type, size }: AnyAction
): AppState | number | null => {
	if ( type !== REWIND_SIZE_SET ) {
		return state;
	}

	return size.bytesUsed ?? null;
};

const minDaysOfBackupsAllowed = (
	state: AppState = null,
	{ type, size }: AnyAction
): AppState | number | null => {
	if ( type !== REWIND_SIZE_SET ) {
		return state;
	}

	return size.minDaysOfBackupsAllowed ?? null;
};

const daysOfBackupsAllowed = (
	state: AppState = null,
	{ type, size }: AnyAction
): AppState | number | null => {
	if ( type !== REWIND_SIZE_SET ) {
		return state;
	}

	return size.daysOfBackupsAllowed ?? null;
};

const daysOfBackupsSaved = (
	state: AppState = null,
	{ type, size }: AnyAction
): AppState | number | null => {
	if ( type !== REWIND_SIZE_SET ) {
		return state;
	}

	return size.daysOfBackupsSaved ?? null;
};

const retentionDays = ( state: AppState = null, payload: AnyAction ): AppState | number | null => {
	switch ( payload.type ) {
		case REWIND_SIZE_SET:
			return payload.size.retentionDays ?? null;
		case JETPACK_BACKUP_RETENTION_SET:
			return payload.retentionDays ?? null;
	}

	return state;
};

const lastBackupSize = (
	state: AppState = null,
	{ type, size }: AnyAction
): AppState | number | null => {
	if ( type !== REWIND_SIZE_SET ) {
		return state;
	}

	return size.lastBackupSize ?? null;
};

export default combineReducers( {
	requestStatus,
	bytesUsed,
	minDaysOfBackupsAllowed,
	daysOfBackupsAllowed,
	daysOfBackupsSaved,
	retentionDays,
	lastBackupSize,
} );
