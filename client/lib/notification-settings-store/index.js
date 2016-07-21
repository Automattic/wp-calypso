/*eslint-disable new-cap */

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
		dirty: null
	}
};

function toggleSetting( state, source ) {
	if ( toggleState[ source ] ) {
		return toggleState[ source ].apply( this, arguments );
	}

	return toggleState.blog.apply( this, arguments );
}

const NotificationSettingsStore = createReducerStore( ( state, payload ) => {
	const { action, data, error, source, stream, setting } = payload.action;
	const status = null;
	let newState = null;

	switch ( action ) {
		case actionTypes.SAVE_SETTINGS:
		case actionTypes.FETCH_SETTINGS:
			return state.set( 'isFetching', true ).set( 'status', status );

		case actionTypes.SAVE_SETTINGS_FAILED:
		case actionTypes.FETCH_SETTINGS_FAILED:
			return state.set( 'isFetching', false ).set( 'error', error );

		case actionTypes.SAVE_SETTINGS_COMPLETE:
		case actionTypes.FETCH_SETTINGS_COMPLETE:
			newState = Immutable.fromJS( data );
			return state
				.set( 'isFetching', false )
				.set( 'status', action === actionTypes.SAVE_SETTINGS_COMPLETE ? 'success' : null )
				.setIn( [ 'settings', 'clean' ], newState )
				.setIn( [ 'settings', 'dirty' ], newState );

		case actionTypes.TOGGLE_SETTING:
			return toggleSetting( state, source, stream, setting ).set( 'status', status );
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
		hasUnsavedChanges: ! Immutable.is( clean, dirty )
	};
};

export default NotificationSettingsStore;
/*eslint-enable new-cap */
