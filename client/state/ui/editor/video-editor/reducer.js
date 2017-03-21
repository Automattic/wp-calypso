/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	VIDEO_EDITOR_RESET_STATE,
	VIDEO_EDITOR_SET_POSTER_URL,
	VIDEO_EDITOR_SHOW_ERROR,
	VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
} from 'state/action-types';

/**
 * Tracks poster updated state.
 *
 * @param {Boolean} state Whether or not the video poster was already updated
 * @param {Object} action Action object
 * @returns {Boolean} Whether or not the video poster is now updated
 */
export const isPosterUpdated = ( state = false, action ) => {
	switch ( action.type ) {
		case VIDEO_EDITOR_SET_POSTER_URL:
		case VIDEO_EDITOR_SHOW_ERROR:
			return true;

		case VIDEO_EDITOR_RESET_STATE:
			return false;
	}

	return state;
};

/**
 * Tracks poster URL state.
 *
 * @param  {String} state Current poster URL
 * @param  {Object} action Action object
 * @return {String} Updated poster URL
 */
export const posterUrl = ( state = '', action ) => {
	switch ( action.type ) {
		case VIDEO_EDITOR_SET_POSTER_URL:
			return action.posterUrl;

		case VIDEO_EDITOR_RESET_STATE:
			return '';
	}

	return state;
};

/**
 * Tracks poster upload progress state.
 *
 * @param  {Number} state Current upload progress of the poster
 * @param  {Object} action Action object
 * @return {Number} Updated upload progress of the poster
 */
export const uploadProgress = ( state = 0, action ) => {
	switch ( action.type ) {
		case VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS:
			return action.percentage;

		case VIDEO_EDITOR_RESET_STATE:
			return 0;
	}

	return state;
};

/**
 * Tracks poster error state.
 *
 * @param  {Boolean} state Whether or not an error was previously encountered while updating the poster
 * @param  {Object} action Action object
 * @return {Boolean} Whether or not an error has now been encountered while updating the poster
 */
export const hasPosterUpdateError = ( state = false, { type } ) => type === VIDEO_EDITOR_SHOW_ERROR;

export default combineReducers( {
	hasPosterUpdateError,
	isPosterUpdated,
	posterUrl,
	uploadProgress,
} );
