/** @format */
/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import toggleState from 'state/notification-settings/toggle-state';
import {
	NOTIFICATION_SETTINGS_FETCH,
	NOTIFICATION_SETTINGS_FETCH_COMPLETE,
	NOTIFICATION_SETTINGS_FETCH_FAILED,
	NOTIFICATION_SETTINGS_TOGGLE_SETTING,
	NOTIFICATION_SETTINGS_SAVE,
	NOTIFICATION_SETTINGS_SAVE_COMPLETE,
	NOTIFICATION_SETTINGS_SAVE_FAILED,
} from 'state/action-types';

function toggleSetting( state, source ) {
	if ( toggleState[ source ] ) {
		return toggleState[ source ].apply( this, arguments );
	}

	return toggleState.blog.apply( this, arguments );
}

export const isFetching = ( state = false, action ) => {
	switch ( action.type ) {
		case NOTIFICATION_SETTINGS_FETCH:
		case NOTIFICATION_SETTINGS_SAVE: {
			return true;
		}
		case NOTIFICATION_SETTINGS_FETCH_COMPLETE:
		case NOTIFICATION_SETTINGS_FETCH_FAILED:
		case NOTIFICATION_SETTINGS_SAVE_COMPLETE:
		case NOTIFICATION_SETTINGS_SAVE_FAILED: {
			return false;
		}
	}

	return state;
};

export const settings = ( state = { clean: null, dirty: null }, action ) => {
	switch ( action.type ) {
		case NOTIFICATION_SETTINGS_FETCH_COMPLETE:
		case NOTIFICATION_SETTINGS_SAVE_COMPLETE: {
			return {
				clean: action.data,
				dirty: action.data,
			};
		}
		case NOTIFICATION_SETTINGS_TOGGLE_SETTING: {
			const { source, stream, setting } = action;

			return {
				...state,
				dirty: {
					...state.dirty,
					...toggleSetting( state, source, stream, setting ),
				},
			};
		}
	}

	return state;
};

export default combineReducers( {
	isFetching,
	settings,
} );
