/**
 * Internal dependencies
 */
import {
	EDITOR_IFRAME_LOADED,
	EDITOR_START,
	EDITOR_STOP,
	POST_SAVE_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, withoutPersistence, withStorageKey } from 'calypso/state/utils';
import imageEditor from './image-editor/reducer';
import videoEditor from './video-editor/reducer';
import lastDraft from './last-draft/reducer';

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

export function isIframeLoaded( state = false, action ) {
	switch ( action.type ) {
		case EDITOR_IFRAME_LOADED: {
			const loaded = action.isIframeLoaded;
			return loaded !== undefined ? loaded : state;
		}
	}

	return state;
}

export const iframePort = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case EDITOR_IFRAME_LOADED: {
			const loaded = action.isIframeLoaded;
			return loaded && action.iframePort ? action.iframePort : null;
		}
	}

	return state;
} );

const combinedReducer = combineReducers( {
	postId,
	isIframeLoaded,
	iframePort,
	imageEditor,
	videoEditor,
	lastDraft,
} );

export default withStorageKey( 'editor', combinedReducer );
