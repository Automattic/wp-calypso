/**
 * Internal dependencies
 */
import {
	MEDIA_FILE_UPLOAD_FAILURE,
	MEDIA_FILE_UPLOAD_SUCCESS,
	MEDIA_FILE_UPLOADS_ENQUEUE
} from 'state/action-types';
import { uploadFile } from 'state/media/actions';
import { isMediaUploadInProgress, getNextQueuedUpload } from 'state/media/selectors';

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
	[ MEDIA_FILE_UPLOADS_ENQUEUE ]: [ maybeUploadFirst ],
	[ MEDIA_FILE_UPLOAD_FAILURE ]: [ uploadNext ],
	[ MEDIA_FILE_UPLOAD_SUCCESS ]: [ uploadNext ]
};
