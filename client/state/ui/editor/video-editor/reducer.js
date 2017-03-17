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
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
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
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
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
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
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
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export const hasPosterUpdateError = ( state = false, action ) => {
	switch ( action.type ) {
		case VIDEO_EDITOR_SHOW_ERROR:
			return true;

		case VIDEO_EDITOR_SET_POSTER_URL:
		case VIDEO_EDITOR_RESET_STATE:
			return false;
	}

	return state;
};

export default combineReducers( {
	hasPosterUpdateError,
	isPosterUpdated,
	posterUrl,
	uploadProgress,
} );
