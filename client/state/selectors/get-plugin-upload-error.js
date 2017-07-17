/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns any error from a plugin uploaded to a site.
 *
 * @param {Object} state Global state tree
 * @param {number} siteId the site ID
 * @return {?Object} Error from upload, if any
 */
export default function getPluginUploadError( state, siteId ) {
	return get( state.plugins.upload.uploadError, siteId, null );
}
