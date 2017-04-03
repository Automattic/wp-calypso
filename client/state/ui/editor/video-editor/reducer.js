/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	VIDEO_EDITOR_CLOSE_MODAL,
	VIDEO_EDITOR_SET_POSTER_URL,
	VIDEO_EDITOR_SHOW_ERROR,
	VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
} from 'state/action-types';

/**
 * Tracks whether or not the modal should close.
 *
 * @param {Boolean} state Whether or not the modal was set to close
 * @param {Object} action Action object
 * @returns {Boolean} Whether or not the modal should now be closed
 */
export const closeModal = ( state = false, { type } ) => type === VIDEO_EDITOR_CLOSE_MODAL;

/**
 * Tracks poster URL state.
 *
 * @param  {String} state Current poster URL
 * @param  {Object} action Action object
 * @return {String} Updated poster URL
 */
export const url = ( state = null, { type, posterUrl } ) =>
	VIDEO_EDITOR_SET_POSTER_URL === type
		? posterUrl
		: state;

/**
 * Tracks poster upload progress state.
 *
 * @param  {Number} state Current upload progress of the poster
 * @param  {Object} action Action object
 * @return {Number} Updated upload progress of the poster
 */
export const uploadProgress = ( state = null, { type, percentage } ) => {
	if ( VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS === type ) {
		return percentage;
	}

	if ( VIDEO_EDITOR_CLOSE_MODAL === type ) {
		return null;
	}

	return state;
};

/**
 * Tracks whether or not an error should be shown.
 *
 * @param  {Boolean} state Whether or not an error was to be shown
 * @param  {Object} action Action object
 * @return {Boolean} Whether or not an error should now be shown
 */
export const showError = ( state = false, { type } ) => type === VIDEO_EDITOR_SHOW_ERROR;

export default combineReducers( {
	closeModal,
	showError,
	uploadProgress,
	url,
} );
