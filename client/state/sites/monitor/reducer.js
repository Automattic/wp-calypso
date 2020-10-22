/**
 * External dependencies
 */

import { stubFalse, stubTrue } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer, withoutPersistence } from 'calypso/state/utils';
import {
	SITE_MONITOR_SETTINGS_RECEIVE,
	SITE_MONITOR_SETTINGS_REQUEST,
	SITE_MONITOR_SETTINGS_REQUEST_FAILURE,
	SITE_MONITOR_SETTINGS_REQUEST_SUCCESS,
	SITE_MONITOR_SETTINGS_UPDATE,
	SITE_MONITOR_SETTINGS_UPDATE_FAILURE,
	SITE_MONITOR_SETTINGS_UPDATE_SUCCESS,
} from 'calypso/state/action-types';

export const items = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_MONITOR_SETTINGS_RECEIVE: {
			const { siteId, settings } = action;

			return {
				...state,
				[ siteId ]: settings,
			};
		}
	}

	return state;
} );

export const requesting = keyedReducer(
	'siteId',
	withoutPersistence( ( state = {}, action ) => {
		switch ( action.type ) {
			case SITE_MONITOR_SETTINGS_REQUEST:
				return stubTrue( state, action );
			case SITE_MONITOR_SETTINGS_REQUEST_SUCCESS:
				return stubFalse( state, action );
			case SITE_MONITOR_SETTINGS_REQUEST_FAILURE:
				return stubFalse( state, action );
		}

		return state;
	} )
);

export const updating = keyedReducer(
	'siteId',
	withoutPersistence( ( state = {}, action ) => {
		switch ( action.type ) {
			case SITE_MONITOR_SETTINGS_UPDATE:
				return stubTrue( state, action );
			case SITE_MONITOR_SETTINGS_UPDATE_SUCCESS:
				return stubFalse( state, action );
			case SITE_MONITOR_SETTINGS_UPDATE_FAILURE:
				return stubFalse( state, action );
		}

		return state;
	} )
);

export default combineReducers( {
	items,
	requesting,
	updating,
} );
