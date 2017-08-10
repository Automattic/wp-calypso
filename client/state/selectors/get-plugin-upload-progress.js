/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns percentage of plugin zip uploaded to a site.
 *
 * @param {Object} state Global state tree
 * @param {number} siteId the site ID
 * @return {number} % of file uploaded so far
 */
export default function getPluginUploadProgress( state, siteId ) {
	return get( state.plugins.upload.progressPercent, siteId, 0 );
}
