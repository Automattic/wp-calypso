/**
 * Internal dependencies
 */
import {
	MEDIA_FILE_UPLOAD,
	MEDIA_FILE_UPLOAD_FAILURE,
	MEDIA_FILE_UPLOAD_SUCCESS,
	MEDIA_FILE_UPLOADS_ENQUEUE
} from 'state/action-types';
import { uploadFile, receiveMediaItems } from 'state/media/actions';
import { isMediaUploadInProgress, getNextQueuedUpload } from 'state/media/selectors';
import wpcom from 'lib/wp';

export function requestFileUpload( store, action ) {
	const { siteId, file } = action;

	// Determine upload mechanism by object type
	const isUrl = 'string' === typeof file;
	const addHandler = isUrl ? 'addMediaUrls' : 'addMediaFiles';

	return wpcom.site( siteId )[ addHandler ]( file ).then( ( { media } ) => {
		// Success response always returns media array, even single upload
		store.dispatch( receiveMediaItems( siteId, media ) );
		store.dispatch( {
			type: MEDIA_FILE_UPLOAD_SUCCESS,
			siteId,
			file
		} );
	} ).catch( () => {
		store.dispatch( {
			type: MEDIA_FILE_UPLOAD_FAILURE,
			siteId,
			file
		} );
	} );
}

export function uploadNext( store ) {
	const nextQueued = getNextQueuedUpload( store.getState() );
	if ( nextQueued ) {
		const { siteId, file } = nextQueued;
		store.dispatch( uploadFile( siteId, file ) );
	}
}

export function maybeUploadFirst( store, action ) {
	if ( ! isMediaUploadInProgress( store.getState() ) ) {
		store.dispatch( uploadFile( action.siteId, action.files[ 0 ] ) );
	}
}

export default {
	[ MEDIA_FILE_UPLOAD ]: [ requestFileUpload ],
	[ MEDIA_FILE_UPLOADS_ENQUEUE ]: [ maybeUploadFirst ],
	[ MEDIA_FILE_UPLOAD_FAILURE ]: [ uploadNext ],
	[ MEDIA_FILE_UPLOAD_SUCCESS ]: [ uploadNext ]
};
