/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	READER_FULLPOST_SET_VISIBILITY,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

export function isVisible( state = false, action ) {
	switch ( action.type ) {
		case READER_FULLPOST_SET_VISIBILITY:
			return action.show;
		case SERIALIZE:
			return false;
		case DESERIALIZE:
			return false;
	}

	return state;
}

export default combineReducers( {
	isVisible
} );

