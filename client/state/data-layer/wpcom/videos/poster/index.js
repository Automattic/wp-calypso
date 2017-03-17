/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { VIDEO_EDITOR_UPDATE_POSTER } from 'state/action-types';
import {
	setPosterUrl,
	showError,
	showUploadProgress,
} from 'state/ui/editor/video-editor/actions';

/**
 * Updates the poster for a video.
 *
 * @param  {Object} store  Redux store
 * @param  {Object} action  Action object
 * @param {Function} next  Dispatches to next middleware in chain
 * @returns {Object} original action
 */
export const updatePoster = ( { dispatch }, action, next ) => {
	if ( ! ( 'file' in action.params ) && ! ( 'at_time' in action.params ) ) {
		return next( action );
	}

	const params = {
		apiVersion: '1.1',
		method: 'POST',
		path: `/videos/${ action.videoId }/poster`,
	};

	if ( 'file' in action.params ) {
		params.formData = [ [ 'poster', action.params.file ] ];
	}

	if ( 'at_time' in action.params ) {
		params.body = action.params;
	}

	dispatch( http( params, action ) );

	return next( action );
};

export const updatePosterUrl = ( { dispatch }, action, next, { poster } ) => {
	dispatch( setPosterUrl( poster ) );
};

export const updatePosterError = ( { dispatch } ) => {
	dispatch( showError() );
};

export const updateUploadProgress = ( { dispatch }, action, next, progress ) => {
	let percentage = 0;

	if ( 'loaded' in progress && 'total' in progress ) {
		percentage = Math.min( Math.round( progress.loaded / progress.total * 100 ), 100 );
	}

	dispatch( showUploadProgress( percentage ) );
};

export const dispatchPosterRequest = dispatchRequest( updatePoster, updatePosterUrl, updatePosterError, updateUploadProgress );

export default {
	[ VIDEO_EDITOR_UPDATE_POSTER ]: [ dispatchPosterRequest ],
};
