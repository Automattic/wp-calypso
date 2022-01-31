import {
	VIDEO_EDITOR_UPDATE_POSTER,
	VIDEO_EDITOR_REFRESH_POSTER,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	setPosterUrl,
	showError,
	showUploadProgress,
} from 'calypso/state/editor/video-editor/actions';
import { receiveMedia } from 'calypso/state/media/actions';
import getMediaItem from 'calypso/state/selectors/get-media-item';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

// Internal action
const refreshAction = ( videoId, meta ) => ( {
	type: VIDEO_EDITOR_REFRESH_POSTER,
	meta: meta,
	videoId: videoId,
} );

const refresh = ( action ) => {
	const params = {
		apiVersion: '1.1',
		method: 'GET',
		path: `/videos/${ action.videoId }/poster`,
	};
	return http( params, action );
};

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

const onSuccess = ( action, data ) => ( dispatch, getState ) => {
	const { poster: posterUrl } = data;

	if ( data.generating ) {
		setTimeout( () => {
			dispatch( refreshAction( action.videoId, { mediaId: action.meta.mediaId } ) );
		}, 1000 );
		return;
	}

	dispatch( setPosterUrl( posterUrl ) );

	const currentState = getState();

	const siteId = getSelectedSiteId( currentState );
	const mediaItem = getMediaItem( currentState, siteId, action.meta.mediaId );

	// Photon does not support URLs with a querystring component.
	const urlBeforeQuery = ( posterUrl || '' ).split( '?' )[ 0 ];

	const updatedMediaItem = {
		...mediaItem,
		thumbnails: {
			fmt_hd: urlBeforeQuery,
			fmt_dvd: urlBeforeQuery,
			fmt_std: urlBeforeQuery,
		},
	};

	dispatch( receiveMedia( siteId, updatedMediaItem ) );
};

const onError = () => showError();

const onProgress = ( action, progress ) => {
	const hasProgressData = 'loaded' in progress && 'total' in progress;
	const percentage = hasProgressData
		? Math.min( Math.round( ( progress.loaded / ( Number.EPSILON + progress.total ) ) * 100 ), 100 )
		: 0;

	return showUploadProgress( percentage );
};

const dispatchUpdatePosterRequest = dispatchRequest( { fetch, onSuccess, onError, onProgress } );
const dispatchRefreshPosterRequest = dispatchRequest( {
	fetch: refresh,
	onSuccess,
	onError,
	onProgress,
} );

registerHandlers( 'state/data-layer/wpcom/videos/poster/index.js', {
	[ VIDEO_EDITOR_UPDATE_POSTER ]: [ dispatchUpdatePosterRequest ],
	[ VIDEO_EDITOR_REFRESH_POSTER ]: [ dispatchRefreshPosterRequest ],
} );
