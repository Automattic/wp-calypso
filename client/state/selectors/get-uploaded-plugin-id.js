/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/plugins/init';

/**
 * Returns the ID of an uploaded plugin, or
 * null if no plugin has yet been successfully
 * uploaded.
 *
 * @param {object} state Global state tree
 * @param {number} siteId the site ID
 * @returns {?string} ID of uploaded plugin
 */
export default function getUploadedPluginId( state, siteId ) {
	return get( state.plugins.upload.uploadedPluginId, siteId, null );
}
