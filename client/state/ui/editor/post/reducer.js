/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	EDITOR_POST_CURRENT_ID
} from 'state/action-types';

export function currentEditedPostId( state = null, action ) {
	if ( action.type === EDITOR_POST_CURRENT_ID ) {
		return action.postId;
	}

	return state;
}

export default combineReducers( {
	currentEditedPostId
} );
