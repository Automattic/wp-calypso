import {
	VIDEO_EDITOR_SET_POSTER_URL,
	VIDEO_EDITOR_SHOW_ERROR,
	VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

/**
 * Tracks poster URL state.
 */
export const url = ( state = null, { type, posterUrl } ) =>
	VIDEO_EDITOR_SET_POSTER_URL === type ? posterUrl : state;

/**
 * Tracks poster upload progress state.
 */
export const uploadProgress = ( state = null, { type, percentage } ) => {
	if ( VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS === type ) {
		return percentage;
	}

	if ( VIDEO_EDITOR_SET_POSTER_URL === type ) {
		return null;
	}

	return state;
};

/**
 * Tracks whether or not an error should be shown.
 */
export const showError = ( state, { type } ) => type === VIDEO_EDITOR_SHOW_ERROR;

export default combineReducers( {
	showError,
	uploadProgress,
	url,
} );
