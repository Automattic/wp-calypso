/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the ID of an uploaded plugin, or
 * null if no plugin has yet been successfully
 * uploaded.
 *
 * @param {Object} state Global state tree
 * @param {number} siteId the site ID
 * @return {?String} ID of uploaded plugin
 */
export default function getUploadedPluginId( state, siteId ) {
	return get( state.plugins.upload.uploadedPluginId, siteId, null );
}
