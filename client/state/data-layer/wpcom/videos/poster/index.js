/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { VIDEO_EDITOR_POSTER_UPDATE } from 'state/action-types';
import {
	updateVideoEditorPosterSuccess,
	updateVideoEditorPosterFailure,
	updatingVideoEditorPoster,
} from 'state/ui/editor/video-editor/actions';

/**
 * Updates the poster for a video.
 *
 * @param  {Object} store  Redux store
 * @param  {Object} action  Action object
 * @param {Function} next  Dispatches to next middleware in chain
 * @returns {Object} original action
 */
export const updateVideoEditorPoster = ( { dispatch }, action, next ) => {
	if ( ! ( 'file' in action.params ) && ! ( 'at_time' in action.params ) ) {
		return next( action );
	}

	dispatch( updatingVideoEditorPoster() );

	dispatch( http( {
		apiVersion: '1.1',
		method: 'POST',
		path: `/videos/${ action.videoId }/poster`,
		body: 'at_time' in action.params ? action.params : undefined,
		formData: 'file' in action.params ? [ [ 'poster', action.params.file ] ] : undefined,
		onSuccess: action,
		onFailure: action,
	} ) );

	return next( action );
};

export const updateVideoPosterSuccess = ( { dispatch }, action, next, { poster } ) => {
	dispatch( updateVideoEditorPosterSuccess( poster ) );
};

export const updateVideoPosterError = ( { dispatch } ) => {
	dispatch( updateVideoEditorPosterFailure() );
};

export default {
	[ VIDEO_EDITOR_POSTER_UPDATE ]: [ dispatchRequest( updateVideoEditorPoster, updateVideoPosterSuccess, updateVideoPosterError ) ],
};
