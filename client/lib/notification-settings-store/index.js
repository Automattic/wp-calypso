/**
 * /*eslint-disable new-cap
 *
 * @format
 */

/**
 * External Dependencies
 */
import Immutable from 'immutable';

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
			const prevState = state.toJS();

			return Immutable.fromJS( {
				...prevState,
				isFetching: true,
				status: null,
			} );
		}
		case actionTypes.SAVE_SETTINGS_FAILED:
		case actionTypes.FETCH_SETTINGS_FAILED: {
			const prevState = state.toJS();

			return Immutable.fromJS( {
				...prevState,
				isFetching: false,
				error,
			} );
		}
		case actionTypes.SAVE_SETTINGS_COMPLETE:
		case actionTypes.FETCH_SETTINGS_COMPLETE: {
			const prevState = state.toJS();

			return Immutable.fromJS( {
				...prevState,
				isFetching: false,
				status: action === actionTypes.SAVE_SETTINGS_COMPLETE ? 'success' : null,
				settings: {
					...prevState.settings,
					clean: data,
					dirty: data,
				},
			} );
		}
		case actionTypes.TOGGLE_SETTING: {
			return Immutable.fromJS( {
				...toggleSetting( state.toJS(), source, stream, setting ),
				status: null,
			} );
		}
	}

	return state;
}, Immutable.fromJS( initialState ) );

NotificationSettingsStore.getStateFor = function( source ) {
	const state = NotificationSettingsStore.get();
	const clean = state.getIn( [ 'settings', 'clean' ] );
	const dirty = state.getIn( [ 'settings', 'dirty' ] );

	return {
		status: state.get( 'status' ),
		error: state.get( 'error' ),
		settings: dirty && dirty.get( source ),
		hasUnsavedChanges: ! Immutable.is( clean, dirty ),
	};
};

export default NotificationSettingsStore;
/*eslint-enable new-cap */
