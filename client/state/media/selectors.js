/**
 * Returns true if an upload is in progress, or false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether upload is in progress
 */
export function isMediaUploadInProgress( state ) {
	return state.media.uploadQueue.length > 0;
}

/**
 * Returns next queued upload descriptor, or null if there is nothing in queue
 * yet to be processed. An upload descriptor is an object of keys siteId, file.
 *
 * @param  {Object}  state Global state tree
 * @return {?Object}       Queued upload descriptor
 */
export function getNextQueuedUpload( state ) {
	if ( ! isMediaUploadInProgress( state ) ) {
		return null;
	}

	const [ siteId, file ] = state.media.uploadQueue[ 0 ];
	return { siteId, file };
}
