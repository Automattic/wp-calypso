/**
 * Internal dependencies
 */
import {
	PLUGIN_UPLOAD,
	PLUGIN_UPLOAD_CLEAR,
	PLUGIN_UPLOAD_COMPLETE,
	PLUGIN_UPLOAD_ERROR,
	PLUGIN_UPLOAD_PROGRESS,
} from 'state/action-types';

/**
 * Upload a plugin to a site.
 *
 * @param {number} siteId site ID
 * @param {File} file the plugin zip to upload
 * @return {Object} action object
 */
export function uploadPlugin( siteId, file ) {
	return {
		type: PLUGIN_UPLOAD,
		siteId,
		file,
	};
}

/**
 * Update progress for an uploading plugin.
 *
 * @param {number} siteId site ID
 * @param {number} loaded bytes of plugin zip uploaded so far
 * @param {number} total total bytes to upload
 * @return {Object} action object
 */
export function updatePluginUploadProgress( siteId, loaded, total ) {
	return {
		type: PLUGIN_UPLOAD_PROGRESS,
		siteId,
		loaded,
		total,
	};
}

/**
 * Mark a plugin upload as complete.
 *
 * @param {number} siteId site ID
 * @param {string} pluginId plugin id
 * @return {Object} action object
 */
export function completePluginUpload( siteId, pluginId ) {
	return {
		type: PLUGIN_UPLOAD_COMPLETE,
		siteId,
		pluginId,
	};
}

/**
 * Set an error from a plugin upload.
 *
 * @param {number} siteId site ID
 * @param {Object} error the error
 * @return {Object} action object
 */
export function pluginUploadError( siteId, error ) {
	return {
		type: PLUGIN_UPLOAD_ERROR,
		siteId,
		error,
	};
}

/**
 * Clear any plugin upload data for a site.
 *
 * @param {number} siteId site ID
 * @return {Object} action object
 */
export function clearPluginUpload( siteId ) {
	return {
		type: PLUGIN_UPLOAD_CLEAR,
		siteId,
	};
}
