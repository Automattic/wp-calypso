/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { EDITOR_START, POST_SAVE_SUCCESS } from 'state/action-types';
import imageEditor from './image-editor/reducer';
import videoEditor from './video-editor/reducer';
import lastDraft from './last-draft/reducer';
import contactForm from './contact-form/reducer';

/**
 * Returns the updated editor post ID state after an action has been
 * dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function postId( state = null, action ) {
	switch ( action.type ) {
		case EDITOR_START:
			return action.postId;
		case POST_SAVE_SUCCESS:
			return state === action.postId ? action.savedPost.ID : state;
	}

	return state;
}

export default combineReducers( {
	postId,
	imageEditor,
	videoEditor,
	lastDraft,
	contactForm
} );
