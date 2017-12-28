/** @format */

/**
 * Internal dependencies
 */

import { http } from 'client/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import { VIDEO_EDITOR_UPDATE_POSTER } from 'client/state/action-types';
import {
	setPosterUrl,
	showError,
	showUploadProgress,
} from 'client/state/ui/editor/video-editor/actions';

/**
 * Updates the poster for a video.
 *
 * @param  {Object} store Redux store
 * @param  {Object} action Action object
 */
export const updatePoster = ( { dispatch }, action ) => {
	if ( ! ( 'file' in action.params || 'atTime' in action.params ) ) {
		return;
	}

	const { atTime, file } = action.params;
	const params = Object.assign(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: `/videos/${ action.videoId }/poster`,
		},
		file && { formData: [ [ 'poster', file ] ] },
		atTime !== undefined && { body: { at_time: atTime } }
	);

	dispatch( http( params, action ) );
};

export const receivePosterUrl = ( { dispatch }, action, { poster: posterUrl } ) => {
	dispatch( setPosterUrl( posterUrl ) );
};

export const receivePosterError = ( { dispatch } ) => {
	dispatch( showError() );
};

export const receiveUploadProgress = ( { dispatch }, action, progress ) => {
	let percentage = 0;

	if ( 'loaded' in progress && 'total' in progress ) {
		percentage = Math.min( Math.round( progress.loaded / progress.total * 100 ), 100 );
	}

	dispatch( showUploadProgress( percentage ) );
};

export const dispatchPosterRequest = dispatchRequest(
	updatePoster,
	receivePosterUrl,
	receivePosterError,
	{ onProgress: receiveUploadProgress }
);

export default {
	[ VIDEO_EDITOR_UPDATE_POSTER ]: [ dispatchPosterRequest ],
};
