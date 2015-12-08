/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import {
	SET_EXPORT_POST_TYPE,
	SET_EXPORTER_ADVANCED_SETTING,
	FETCH_EXPORTER_ADVANCED_SETTINGS,
	RECEIVE_EXPORTER_ADVANCED_SETTINGS,
	REQUEST_START_EXPORT,
	REPLY_START_EXPORT,
	FAIL_EXPORT,
	COMPLETE_EXPORT
} from 'state/action-types';

import { States } from './constants';

const initialUIState = Immutable.fromJS( {
	exportingState: States.READY,
	postType: null,
	advancedSettings: {
		'posts': {},
		'pages': {},
		'feedback': {}
	}
} );

const initialDataState = Immutable.fromJS( {
	siteId: null,
	advancedSettings: null
} );

/**
 * Reducer for managing the exporter UI
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function ui( state = initialUIState, action ) {
	switch ( action.type ) {
		case SET_EXPORT_POST_TYPE:
			return state.set( 'postType', action.postType );

		case SET_EXPORTER_ADVANCED_SETTING:
			const { section, setting, value } = action;
			return state.setIn( [ 'advancedSettings', section, setting ], value );

		case REQUEST_START_EXPORT:
			return state.set( 'exportingState', States.STARTING );

		case REPLY_START_EXPORT:
			return state.set( 'exportingState', States.EXPORTING );

		case FAIL_EXPORT:
		case COMPLETE_EXPORT:
			return state.set( 'exportingState', States.READY );
	}

	return state;
}

export function data( state = initialDataState, action ) {
	switch ( action.type ) {
		case FETCH_EXPORTER_ADVANCED_SETTINGS:
			return state;

		case RECEIVE_EXPORTER_ADVANCED_SETTINGS:
			return state
				.set( 'siteId', action.siteId )
				.set( 'advancedSettings', Immutable.fromJS( action.data ) );
	}

	return state;
}

export default combineReducers( {
	ui,
	data
} );
