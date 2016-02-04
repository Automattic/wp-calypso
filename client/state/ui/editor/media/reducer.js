/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	EDITOR_MEDIA_EDIT_ITEM_SET,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

export function editItem( state = null, action ) {
	switch ( action.type ) {
		case EDITOR_MEDIA_EDIT_ITEM_SET:
			return action.item || null;
		case SERIALIZE:
			return null;
		case DESERIALIZE:
			return null;
	}

	return state;
}

export default combineReducers( {
	editItem
} );
