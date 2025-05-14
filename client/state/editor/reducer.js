import { withStorageKey } from '@automattic/state-utils';
import { EDITOR_STOP, POST_SAVE_SUCCESS } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import imageEditor from './image-editor/reducer';
import videoEditor from './video-editor/reducer';

/**
 * Returns the updated editor post ID state after an action has been
 * dispatched.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export function postId( state = null, action ) {
	switch ( action.type ) {
		case EDITOR_STOP:
			return null;
		case POST_SAVE_SUCCESS:
			return state === action.postId ? action.savedPost.ID : state;
	}

	return state;
}

const combinedReducer = combineReducers( {
	postId,
	imageEditor,
	videoEditor,
} );

export default withStorageKey( 'editor', combinedReducer );
