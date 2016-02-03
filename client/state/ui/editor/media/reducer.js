/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	EDITOR_MEDIA_ADVANCED_TOGGLE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

function advanced( state = false, action ) {
	switch ( action.type ) {
		case EDITOR_MEDIA_ADVANCED_TOGGLE:
			return ! state;
		case SERIALIZE:
			return false;
		case DESERIALIZE:
			return false;
	}

	return state;
}

export default combineReducers( {
	advanced
} );
