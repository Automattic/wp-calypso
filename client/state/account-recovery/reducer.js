/**
 * Internal dependencies
 */
import { combineReducers, withoutPersistence, withStorageKey } from 'calypso/state/utils';
import settings from './settings/reducer';
import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
} from 'calypso/state/action-types';

const isFetchingSettings = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_FETCH:
			return true;
		case ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS:
			return false;
		case ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED:
			return false;
	}

	return state;
} );

const combinedReducer = combineReducers( {
	settings,
	isFetchingSettings,
} );

export default withStorageKey( 'accountRecovery', combinedReducer );
