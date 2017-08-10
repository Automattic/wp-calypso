/** @format */
/**
 * Internal dependencies
 */
import reset from './reset/reducer';
import { combineReducers, createReducer } from 'state/utils';
import settings from './settings/reducer';

import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
} from 'state/action-types';

const isFetchingSettings = createReducer( false, {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH ]: () => true,
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS ]: () => false,
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED ]: () => false,
} );

export default combineReducers( {
	settings,
	reset,
	isFetchingSettings,
} );
