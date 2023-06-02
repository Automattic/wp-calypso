import { get } from 'lodash';

import 'calypso/state/plugins/init';

/**
 * Returns any error from a plugin uploaded to a site, or
 * null if currently no error.
 *
 * @param {Object} state Global state tree
 * @param {number} siteId the site ID
 * @returns {null|{error?: string, statusCode: number}} Error from upload, if any
 */
export default function getPluginUploadError( state, siteId ) {
	return get( state.plugins.upload.uploadError, siteId, null );
}
