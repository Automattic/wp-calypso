/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { stubFalse, stubTrue } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer, keyedReducer } from 'state/utils';
import {
	SITE_MONITOR_SETTINGS_RECEIVE,
	SITE_MONITOR_SETTINGS_REQUEST,
	SITE_MONITOR_SETTINGS_REQUEST_FAILURE,
	SITE_MONITOR_SETTINGS_REQUEST_SUCCESS,
	SITE_MONITOR_SETTINGS_UPDATE,
	SITE_MONITOR_SETTINGS_UPDATE_FAILURE,
	SITE_MONITOR_SETTINGS_UPDATE_SUCCESS,
} from 'state/action-types';

export const items = createReducer( {}, {
	[ SITE_MONITOR_SETTINGS_RECEIVE ]: ( state, { siteId, settings } ) => ( { ...state, [ siteId ]: settings } ),
} );

export const requesting = keyedReducer( 'siteId', createReducer( {}, {
	[ SITE_MONITOR_SETTINGS_REQUEST ]: stubTrue,
	[ SITE_MONITOR_SETTINGS_REQUEST_SUCCESS ]: stubFalse,
	[ SITE_MONITOR_SETTINGS_REQUEST_FAILURE ]: stubFalse,
} ) );

export const updating = keyedReducer( 'siteId', createReducer( {}, {
	[ SITE_MONITOR_SETTINGS_UPDATE ]: stubTrue,
	[ SITE_MONITOR_SETTINGS_UPDATE_SUCCESS ]: stubFalse,
	[ SITE_MONITOR_SETTINGS_UPDATE_FAILURE ]: stubFalse,
} ) );

export default combineReducers( {
	items,
	requesting,
	updating,
} );
