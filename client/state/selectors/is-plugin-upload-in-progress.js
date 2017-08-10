/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Indicates whether a plugin upload is currently in progress
 * for the given site.
 *
 * @param {Object} state Global state tree
 * @param {number} siteId the site ID
 * @return {boolean} true if plugin upload is in progress
 */
export default function isPluginUploadInProgress( state, siteId ) {
	return !! get( state.plugins.upload.inProgress, siteId, false );
}
