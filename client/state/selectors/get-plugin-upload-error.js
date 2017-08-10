/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns any error from a plugin uploaded to a site, or
 * null if currently no error.
 *
 * @param {Object} state Global state tree
 * @param {number} siteId the site ID
 * @return {?Object} Error from upload, if any
 */
export default function getPluginUploadError( state, siteId ) {
	return get( state.plugins.upload.uploadError, siteId, null );
}
