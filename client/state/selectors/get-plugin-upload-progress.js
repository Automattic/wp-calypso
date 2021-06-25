/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/plugins/init';

/**
 * Returns percentage of plugin zip uploaded to a site.
 *
 * @param {object} state Global state tree
 * @param {number} siteId the site ID
 * @returns {number} % of file uploaded so far
 */
export default function getPluginUploadProgress( state, siteId ) {
	return get( state.plugins.upload.progressPercent, siteId, 0 );
}
