/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/plugins/init';

/**
 * Indicates whether a plugin upload is currently in progress
 * for the given site.
 *
 * @param {object} state Global state tree
 * @param {number} siteId the site ID
 * @returns {boolean} true if plugin upload is in progress
 */
export default function isPluginUploadInProgress( state, siteId ) {
	return !! get( state.plugins.upload.inProgress, siteId, false );
}
