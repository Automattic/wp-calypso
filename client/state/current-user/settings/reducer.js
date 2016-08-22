/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	CURRENT_USER_SETTINGS_RECEIVE,
	CURRENT_USER_SETTINGS_REQUEST,
	CURRENT_USER_SETTINGS_REQUEST_FAILURE,
	CURRENT_USER_SETTINGS_REQUEST_SUCCESS
} from 'state/action-types';
import { createReducer } from 'state/utils';

export const requesting = createReducer( false, {
	[ CURRENT_USER_SETTINGS_REQUEST ]: () => true,
	[ CURRENT_USER_SETTINGS_REQUEST_FAILURE ]: () => false,
	[ CURRENT_USER_SETTINGS_REQUEST_SUCCESS ]: () => false
} );

export const settings = createReducer( {}, {
	[ CURRENT_USER_SETTINGS_RECEIVE ]: ( state, action ) => {
		return { ...state, ...action.settings };
	}
} );

export default combineReducers( {
	requesting,
	settings
} );
