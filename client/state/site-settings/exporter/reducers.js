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
	REQUEST_START_EXPORT,
	REPLY_START_EXPORT,
	FAIL_EXPORT,
	COMPLETE_EXPORT,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

import { States } from './constants';

export const initialUIState = Immutable.fromJS( {
	exportingState: States.READY,
	postType: null
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

		case REQUEST_START_EXPORT:
			return state.set( 'exportingState', States.STARTING );

		case REPLY_START_EXPORT:
			return state.set( 'exportingState', States.EXPORTING );

		case FAIL_EXPORT:
		case COMPLETE_EXPORT:
			return state.set( 'exportingState', States.READY );
		case SERIALIZE:
			return {};
		case DESERIALIZE:
			return initialUIState;

	}

	return state;
}

export default combineReducers( {
	ui
} );
