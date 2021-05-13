/**
 * Internal dependencies
 */
import {
	VIDEO_EDITOR_SET_POSTER_URL,
	VIDEO_EDITOR_SHOW_ERROR,
	VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

/**
 * Tracks poster URL state.
 *
 * @param  {string} state Current poster URL
 * @param  {object} action Action object
 * @returns {string} Updated poster URL
 */
export const url = ( state = null, { type, posterUrl } ) =>
	VIDEO_EDITOR_SET_POSTER_URL === type ? posterUrl : state;

/**
 * Tracks poster upload progress state.
 *
 * @param  {number} state Current upload progress of the poster
 * @param  {object} action Action object
 * @returns {number} Updated upload progress of the poster
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
 *
 * @param  {boolean} state Whether or not an error was to be shown
 * @param  {object} action Action object
 * @returns {boolean} Whether or not an error should now be shown
 */
export const showError = ( state, { type } ) => type === VIDEO_EDITOR_SHOW_ERROR;

export default combineReducers( {
	showError,
	uploadProgress,
	url,
} );
