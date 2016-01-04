/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { EDITOR_MEDIA_ADVANCED_TOGGLE } from 'state/action-types';

function advanced( state = false, action ) {
	switch ( action.type ) {
		case EDITOR_MEDIA_ADVANCED_TOGGLE:
			state = ! state;
			break;
	}

	return state;
}

export default combineReducers( {
	advanced
} );
