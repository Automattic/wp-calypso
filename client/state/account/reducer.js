import { withStorageKey } from '@automattic/state-utils';
import {
	ACCOUNT_CLOSE_SUCCESS,
	ACCOUNT_RESTORE,
	ACCOUNT_RESTORE_FAILED,
	ACCOUNT_RESTORE_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const isClosed = ( state = false, action ) => {
	switch ( action.type ) {
		case ACCOUNT_CLOSE_SUCCESS: {
			return true;
		}
	}

	return state;
};

export const restoreToken = ( state = null, action ) => {
	switch ( action.type ) {
		case ACCOUNT_CLOSE_SUCCESS: {
			return action.payload.token;
		}
	}

	return state;
};

export const isRestoring = ( state = false, action ) => {
	switch ( action.type ) {
		case ACCOUNT_RESTORE: {
			return true;
		}
		case ACCOUNT_RESTORE_SUCCESS:
		case ACCOUNT_RESTORE_FAILED: {
			return false;
		}
	}

	return state;
};

const combinedReducer = combineReducers( { isClosed, restoreToken, isRestoring } );
export default withStorageKey( 'account', combinedReducer );
