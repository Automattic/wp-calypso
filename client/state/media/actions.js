/**
 * Internal dependencies
 */
import {
	MEDIA_ITEMS_RECEIVE,
	MEDIA_FILE_UPLOAD,
	MEDIA_FILE_UPLOADS_ENQUEUE
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that a media item has been
 * received.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} item   Media item received
 * @return {Object}        Action object
 */
export function receiveMediaItem( siteId, item ) {
	return receiveMediaItems( siteId, [ item ] );
}

/**
 * Returns an action object to be used in signalling that multiple media items
 * have been received.
 *
 * @param  {Number} siteId Site ID
 * @param  {Array}  items  Media items received
 * @return {Object}        Action object
 */
export function receiveMediaItems( siteId, items ) {
	return {
		type: MEDIA_ITEMS_RECEIVE,
		siteId,
		items
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * upload a file to a site.
 *
 * @param  {Number}        siteId Site ID
 * @param  {(String|File)} file   Media URL or File object
 * @return {Function}             Action thunk
 */
export function uploadFile( siteId, file ) {
	return {
		type: MEDIA_FILE_UPLOAD,
		siteId,
		file
	};
}

/**
 * Returns an action object to be used in signalling that a file is to be added
 * to the upload queue.
 *
 * @param  {Number}        siteId Site ID
 * @param  {(String|File)} file   URL or File to be uploaded
 * @return {Object}               Action object
 */
export function enqueueFileUpload( siteId, file ) {
	return enqueueFileUploads( siteId, [ file ] );
}

/**
 * Returns an action object to be used in signalling that files are to be added
 * to the upload queue.
 *
 * @param  {Number}            siteId Site ID
 * @param  {(String[]|File[])} files  Array of URLs or Files to be uploaded
 * @return {Object}                   Action object
 */
export function enqueueFileUploads( siteId, files ) {
	return {
		type: MEDIA_FILE_UPLOADS_ENQUEUE,
		siteId,
		files
	};
}
