/** @format */
/**
 * Internal dependencies
 */
import {
	EDITOR_AUTOSAVE_RESET_PREVIEW_URL,
	EDITOR_AUTOSAVE_SET_PREVIEW_URL,
	EDITOR_START,
	POST_SAVE_SUCCESS,
} from 'state/action-types';
import { combineReducers } from 'state/utils';
import imageEditor from './image-editor/reducer';
import videoEditor from './video-editor/reducer';
import lastDraft from './last-draft/reducer';
import contactForm from './contact-form/reducer';
import saveBlockers from './save-blockers/reducer';

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

function autosavePreviewUrl( state = null, action ) {
	switch ( action.type ) {
		case EDITOR_AUTOSAVE_RESET_PREVIEW_URL:
			return null;
		case EDITOR_AUTOSAVE_SET_PREVIEW_URL:
			return action.previewUrl;
	}

	return state;
}

export default combineReducers( {
	postId,
	autosavePreviewUrl,
	imageEditor,
	videoEditor,
	lastDraft,
	contactForm,
	saveBlockers,
} );
