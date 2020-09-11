/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	EDITOR_AUTOSAVE,
	EDITOR_AUTOSAVE_SUCCESS,
	EDITOR_AUTOSAVE_FAILURE,
	EDITOR_AUTOSAVE_RESET,
	EDITOR_IFRAME_LOADED,
	EDITOR_RESET,
	EDITOR_START,
	EDITOR_STOP,
	POST_SAVE_SUCCESS,
} from 'state/action-types';
import { combineReducers, withStorageKey } from 'state/utils';
import imageEditor from './image-editor/reducer';
import videoEditor from './video-editor/reducer';
import lastDraft from './last-draft/reducer';
import contactForm from './contact-form/reducer';
import saveBlockers from './save-blockers/reducer';
import rawContent from './raw-content/reducer';

/**
 * Returns the updated editor post ID state after an action has been
 * dispatched.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function postId( state = null, action ) {
	switch ( action.type ) {
		case EDITOR_START:
			return action.postId;
		case EDITOR_STOP:
			return null;
		case POST_SAVE_SUCCESS:
			return state === action.postId ? action.savedPost.ID : state;
	}

	return state;
}

export function loadingError( state = null, action ) {
	switch ( action.type ) {
		case EDITOR_RESET:
			return get( action, 'loadingError', null );
	}

	return state;
}

export function isLoading( state = false, action ) {
	switch ( action.type ) {
		case EDITOR_RESET:
			return get( action, 'isLoading', false );
	}

	return state;
}

export function isIframeLoaded( state = false, action ) {
	switch ( action.type ) {
		case EDITOR_IFRAME_LOADED: {
			const loaded = action.isIframeLoaded;
			return loaded !== undefined ? loaded : state;
		}
	}

	return state;
}

export function isAutosaving( state = false, action ) {
	switch ( action.type ) {
		case EDITOR_AUTOSAVE:
			return true;
		case EDITOR_RESET:
		case EDITOR_AUTOSAVE_RESET:
		case EDITOR_AUTOSAVE_SUCCESS:
		case EDITOR_AUTOSAVE_FAILURE:
			return false;
	}

	return state;
}

function autosavePreviewUrl( state = null, action ) {
	switch ( action.type ) {
		case EDITOR_RESET:
		case EDITOR_AUTOSAVE_RESET:
			return null;
		case EDITOR_AUTOSAVE_SUCCESS:
			return action.autosave.preview_URL;
	}

	return state;
}

const combinedReducer = combineReducers( {
	postId,
	loadingError,
	isLoading,
	isIframeLoaded,
	isAutosaving,
	autosavePreviewUrl,
	imageEditor,
	videoEditor,
	lastDraft,
	contactForm,
	saveBlockers,
	rawContent,
} );

export default withStorageKey( 'editor', combinedReducer );
