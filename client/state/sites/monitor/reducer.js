/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import {
	SITE_MONITOR_SETTINGS_RECEIVE,
	SITE_MONITOR_SETTINGS_REQUEST,
	SITE_MONITOR_SETTINGS_REQUEST_FAILURE,
	SITE_MONITOR_SETTINGS_REQUEST_SUCCESS,
	SITE_MONITOR_SETTINGS_UPDATE,
	SITE_MONITOR_SETTINGS_UPDATE_FAILURE,
	SITE_MONITOR_SETTINGS_UPDATE_SUCCESS,
} from 'calypso/state/action-types';

export const items = keyedReducer( 'siteId', ( state = null, action ) => {
	switch ( action.type ) {
		case SITE_MONITOR_SETTINGS_RECEIVE:
			return action.settings;
	}

	return state;
} );

export const requesting = keyedReducer( 'siteId', ( state = false, action ) => {
	switch ( action.type ) {
		case SITE_MONITOR_SETTINGS_REQUEST:
			return true;
		case SITE_MONITOR_SETTINGS_REQUEST_SUCCESS:
		case SITE_MONITOR_SETTINGS_REQUEST_FAILURE:
			return false;
	}

	return state;
} );

export const updating = keyedReducer( 'siteId', ( state = false, action ) => {
	switch ( action.type ) {
		case SITE_MONITOR_SETTINGS_UPDATE:
			return true;
		case SITE_MONITOR_SETTINGS_UPDATE_SUCCESS:
		case SITE_MONITOR_SETTINGS_UPDATE_FAILURE:
			return false;
	}

	return state;
} );

export default combineReducers( {
	items,
	requesting,
	updating,
} );
