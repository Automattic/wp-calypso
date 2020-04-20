/**
 * Internal dependencies
 */

import {
	VIDEO_EDITOR_SET_POSTER_URL,
	VIDEO_EDITOR_SHOW_ERROR,
	VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
	VIDEO_EDITOR_UPDATE_POSTER,
} from 'state/action-types';

import 'state/data-layer/wpcom/videos/poster';

/**
 * Returns an action object to indicate that a request has been made to update the video poster.
 *
 * @param {string} videoId  ID of the video
 * @param {object} params  Poster data
 * @param {number} [params.atTime]  Number of seconds into the video at which to get the poster
 * @param {object} [params.file]  An image to attach to the video
 * @returns {object} Action object
 */
export const updatePoster = ( videoId, params ) => ( {
	type: VIDEO_EDITOR_UPDATE_POSTER,
	videoId,
	params,
} );

/**
 * Returns an action object to indicate that the poster for the video has been updated successfully.
 *
 * @param  {string} posterUrl Poster URL
 * @returns {object} Action object
 */
export const setPosterUrl = ( posterUrl ) => ( { type: VIDEO_EDITOR_SET_POSTER_URL, posterUrl } );

/**
 * Returns an action object to indicate that the poster for the video failed to update.
 *
 * @returns {object} Action object
 */
export const showError = () => ( { type: VIDEO_EDITOR_SHOW_ERROR } );

/**
 * Returns an action object to indicate the poster upload progress.
 *
 * @param  {string} percentage  Upload progress percentage
 * @returns {object} Action object
 */
export const showUploadProgress = ( percentage ) => ( {
	type: VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
	percentage,
} );
