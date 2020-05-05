/**
 * Internal dependencies
 */

import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { VIDEO_EDITOR_UPDATE_POSTER } from 'state/action-types';
import { setPosterUrl, showError, showUploadProgress } from 'state/ui/editor/video-editor/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

const fetch = ( action ) => {
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

const onSuccess = ( action, { poster: posterUrl } ) => setPosterUrl( posterUrl );

const onError = () => showError();

const onProgress = ( action, progress ) => {
	const hasProgressData = 'loaded' in progress && 'total' in progress;
	const percentage = hasProgressData
		? Math.min( Math.round( ( progress.loaded / ( Number.EPSILON + progress.total ) ) * 100 ), 100 )
		: 0;

	return showUploadProgress( percentage );
};

const dispatchUpdatePosterRequest = dispatchRequest( { fetch, onSuccess, onError, onProgress } );

registerHandlers( 'state/data-layer/wpcom/videos/poster/index.js', {
	[ VIDEO_EDITOR_UPDATE_POSTER ]: [ dispatchUpdatePosterRequest ],
} );
