/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import settings from './settings/reducer';
import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
} from 'state/action-types';

function isFetchingSettings( state = false, action ) {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_FETCH:
			return true;
		case ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS:
			return false;
		case ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED:
			return false;
		default:
			return state;
	}
}

export default combineReducers( {
	settings,
	isFetchingSettings,
} );
