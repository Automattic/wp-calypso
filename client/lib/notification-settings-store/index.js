/**
 * /*eslint-disable new-cap
 *
 * @format
 */
/**
 * External Dependencies
 */
import { get, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { actionTypes } from './constants';
import toggleState from './toggle-state';
import { createReducerStore } from 'lib/store';

const initialState = {
	isFetching: false,
	status: null,
	error: null,
	settings: {
		clean: null,
		dirty: null,
	},
};

function toggleSetting( state, source ) {
	if ( toggleState[ source ] ) {
		return toggleState[ source ].apply( this, arguments );
	}

	return toggleState.blog.apply( this, arguments );
}

const NotificationSettingsStore = createReducerStore( ( state, payload ) => {
	const { action, data, error, source, stream, setting } = payload.action;

	switch ( action ) {
		case actionTypes.SAVE_SETTINGS:
		case actionTypes.FETCH_SETTINGS: {
			return {
				...state,
				isFetching: true,
				status: null,
			};
		}
		case actionTypes.SAVE_SETTINGS_FAILED:
		case actionTypes.FETCH_SETTINGS_FAILED: {
			return {
				...state,
				isFetching: false,
				error,
			};
		}
		case actionTypes.SAVE_SETTINGS_COMPLETE:
		case actionTypes.FETCH_SETTINGS_COMPLETE: {
			return {
				...state,
				isFetching: false,
				status: action === actionTypes.SAVE_SETTINGS_COMPLETE ? 'success' : null,
				settings: {
					...state.settings,
					clean: data,
					dirty: data,
				},
			};
		}
		case actionTypes.TOGGLE_SETTING: {
			return {
				...toggleSetting( state, source, stream, setting ),
				status: null,
			};
		}
	}

	return state;
}, initialState );

NotificationSettingsStore.getStateFor = function( source ) {
	const state = NotificationSettingsStore.get();
	const { status, error } = state;
	const clean = get( state, 'settings.clean' );
	const dirty = get( state, 'settings.dirty' );
	const settings = get( dirty, source );
	const hasUnsavedChanges = ! isEqual( clean, dirty );

	return {
		status,
		error,
		settings,
		hasUnsavedChanges,
	};
};

export default NotificationSettingsStore;
/*eslint-enable new-cap */
