/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { EDITOR_MEDIA_EDIT_ITEM_SET } from 'state/action-types';

export function editItem( state = null, action ) {
	switch ( action.type ) {
		case EDITOR_MEDIA_EDIT_ITEM_SET:
			return action.item || null;
	}

	return state;
}

export default combineReducers( {
	editItem
} );
