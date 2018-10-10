/** @format */

/**
 * Internal dependencies
 */

import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { VIDEO_EDITOR_UPDATE_POSTER } from 'state/action-types';
import { setPosterUrl, showError, showUploadProgress } from 'state/ui/editor/video-editor/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const updatePoster = action => {
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

	return http( params, action );
};

export const receivePosterUrl = ( action, { poster: posterUrl } ) => setPosterUrl( posterUrl );

export const receiveUploadProgress = ( action, progress ) => {
	const hasProgressData = 'loaded' in progress && 'total' in progress;
	const percentage = hasProgressData
		? Math.min( Math.round( ( progress.loaded / ( Number.EPSILON + progress.total ) ) * 100 ), 100 )
		: 0;

	return showUploadProgress( percentage );
};

export const dispatchPosterRequest = dispatchRequestEx( {
	fetch: updatePoster,
	onSuccess: receivePosterUrl,
	onError: showError,
	onProgress: receiveUploadProgress,
} );

registerHandlers( 'state/data-layer/wpcom/videos/poster/index.js', {
	[ VIDEO_EDITOR_UPDATE_POSTER ]: [ dispatchPosterRequest ],
} );
