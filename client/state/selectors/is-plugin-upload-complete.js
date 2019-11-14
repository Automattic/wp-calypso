/**
 * Internal dependencies
 */

import getUploadedPluginId from 'state/selectors/get-uploaded-plugin-id';

import isPluginUploadInProgress from 'state/selectors/is-plugin-upload-in-progress';

/**
 * Indicates whether a plugin upload has completed
 * for the given site.
 *
 * @param {Object} state Global state tree
 * @param {number} siteId the site ID
 * @return {boolean} true if plugin upload is complete
 */
export default function isPluginUploadComplete( state, siteId ) {
	return !! ( ! isPluginUploadInProgress( state, siteId ) && getUploadedPluginId( state, siteId ) );
}
