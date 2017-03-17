/**
 * Internal dependencies
 */
import {
	VIDEO_EDITOR_RESET_STATE,
	VIDEO_EDITOR_SET_POSTER_URL,
	VIDEO_EDITOR_SHOW_ERROR,
	VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
	VIDEO_EDITOR_UPDATE_POSTER,
} from 'state/action-types';

/**
 * Returns an action object to be used for resetting the video editor state.
 *
 * @return {Object} Action object
 */
export const resetState = () => {
	return {
		type: VIDEO_EDITOR_RESET_STATE,
	};
};

/**
 * Returns an action object to indicate that a request has been made to update the video poster.
 *
 * @param {String} videoId  ID of the video
 * @param {Object} params  Poster data
 * @param {Number} [params.at_time]  Number of seconds into the video at which to get the poster
 * @param {Object} [params.file]  An image to attach to the video
 * @return {Object} Action object
 */
export const updatePoster = ( videoId, params ) => {
	return {
		type: VIDEO_EDITOR_UPDATE_POSTER,
		videoId,
		params,
	};
};

/**
 * Returns an action object to indicate that the poster for the video has been updated successfully.
 *
 * @param  {String} posterUrl  Poster URL
 * @return {Object} Action object
 */
export const setPosterUrl = posterUrl => {
	return {
		type: VIDEO_EDITOR_SET_POSTER_URL,
		posterUrl,
	};
};

/**
 * Returns an action object to indicate that the poster for the video failed to update.
 *
 * @return {Object} Action object
 */
export const showError = () => {
	return {
		type: VIDEO_EDITOR_SHOW_ERROR,
	};
};

/**
 * Returns an action object to indicate the poster upload progress.
 *
 * @param  {String} percentage  Upload progress percentage
 * @return {Object} Action object
 */
export const showUploadProgress = percentage => {
	return {
		type: VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
		percentage,
	};
};
