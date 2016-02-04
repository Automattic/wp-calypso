/**
 * External dependencies
 */
import { combineReducers } from 'redux';

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

export function selectedPostType( state = null, action ) {
	switch ( action.type ) {
		case SET_EXPORT_POST_TYPE:
			return action.postType;
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			return state;
	}
	return state;
}

export function exportingState( state = States.READY, action ) {
	switch ( action.type ) {
		case REQUEST_START_EXPORT:
			return States.STARTING;
		case REPLY_START_EXPORT:
			return States.EXPORTING;
		case FAIL_EXPORT:
		case COMPLETE_EXPORT:
			return States.READY;
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			return States.READY;
	}
	return state;
}

export default combineReducers( {
	selectedPostType,
	exportingState
} );
