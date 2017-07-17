/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the ID of an uploaded plugin.
 *
 * @param {Object} state Global state tree
 * @param {number} siteId the site ID
 * @return {?String} ID of uploaded plugin
 */
export default function getUploadedPluginId( state, siteId ) {
	return get( state.plugins.upload.uploadedPluginId, siteId, null );
}
