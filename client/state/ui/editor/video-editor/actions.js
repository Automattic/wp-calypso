/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

import {
	VIDEO_EDITOR_POSTER_UPDATE,
	VIDEO_EDITOR_POSTER_UPDATE_FAILURE,
	VIDEO_EDITOR_POSTER_UPDATE_SUCCESS,
	VIDEO_EDITOR_SCRIPT_LOAD_ERROR,
	VIDEO_EDITOR_STATE_RESET,
	VIDEO_EDITOR_STATE_RESET_POSTER,
	VIDEO_EDITOR_VIDEO_HAS_LOADED,
} from 'state/action-types';

/**
 * Returns an action object to be used for resetting the video editor state.
 *
 * @return {Object} Action object
 */
export const resetVideoEditorState = () => {
	return {
		type: VIDEO_EDITOR_STATE_RESET,
	};
};

/**
 * Returns an action object to be used for resetting the video editor poster state.
 *
 * @return {Object} Action object
 */
export function resetVideoEditorPosterState() {
	return {
		type: VIDEO_EDITOR_STATE_RESET_POSTER,
	};
}

/**
 * Returns an action object to be used when there is an error loading the VideoPress script.
 *
 * @return {Object} Action object
 */
export const setVideoEditorHasScriptLoadError = () => {
	return {
		type: VIDEO_EDITOR_SCRIPT_LOAD_ERROR,
	};
};

/**
 * Returns an action object to be used when the video has loaded.
 *
 * @return {Object} Action object
 */
export const setVideoEditorVideoHasLoaded = () => {
	return {
		type: VIDEO_EDITOR_VIDEO_HAS_LOADED,
	};
};

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * update the poster for a particular video.
 *
 * @param {String} guid  ID of the video
 * @param {Object} params  Poster data
 * @param {Number} [params.at_time]  Number of seconds into the video at which to get the poster
 * @param {Object} [params.file]  An image to attach to the video
 * @return {Function}  Action thunk
 */
export const updateVideoEditorPoster = ( guid, params ) => {
	return ( dispatch ) => {
		dispatch( { type: VIDEO_EDITOR_POSTER_UPDATE } );

		return wpcom.undocumented().updateVideoPoster( guid, params )
			.then( data =>
				dispatch( {
					type: VIDEO_EDITOR_POSTER_UPDATE_SUCCESS,
					poster: data.poster,
				} )
			)
			.catch( error =>
				dispatch( {
					type: VIDEO_EDITOR_POSTER_UPDATE_FAILURE,
					error
				} )
			);
	};
};
