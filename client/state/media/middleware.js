/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import {
	MEDIA_FILE_UPLOAD_FAILURE,
	MEDIA_FILE_UPLOAD_SUCCESS,
	MEDIA_FILE_UPLOADS_ENQUEUE
} from 'state/action-types';
import { uploadFile } from './actions';
import { isMediaUploadInProgress, getNextQueuedUpload } from './selectors';

/**
 * Action types indicating media upload completion.
 *
 * @type {Array}
 */
const UPLOAD_COMPLETE_TYPES = [ MEDIA_FILE_UPLOAD_FAILURE, MEDIA_FILE_UPLOAD_SUCCESS ];

/**
 * Middleware used in managing file uploads as a series queue, triggering the
 * next queued upload only while a queued upload is not already in progress and
 * there are queued items remaining to be uploaded.
 *
 * @param  {Object}   store Redux store instance
 * @return {Function}       Middleware function
 */
export const uploadQueueMiddleware = ( { dispatch, getState } ) => ( next ) => ( action ) => {
	// Trigger upload of first item upon enqueue if no uploads in progress.
	// This check is made prior to proceeding with middleware stack since
	// applying the action will cause upload queue to be filled in state.
	if ( MEDIA_FILE_UPLOADS_ENQUEUE === action.type && ! isMediaUploadInProgress( getState() ) ) {
		dispatch( uploadFile( action.siteId, action.files[ 0 ] ) );
	}

	const result = next( action );

	// When upload completes, check whether there are more items in queue to be
	// processed and trigger upload
	if ( includes( UPLOAD_COMPLETE_TYPES, action.type ) ) {
		const nextQueued = getNextQueuedUpload( getState() );
		if ( nextQueued ) {
			const { siteId, file } = nextQueued;
			dispatch( uploadFile( siteId, file ) );
		}
	}

	return result;
};
