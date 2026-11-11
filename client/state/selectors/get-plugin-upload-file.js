import 'calypso/state/plugins/init';

/**
 * Returns the zip file from the latest plugin upload, or
 * null if no upload is available for a site.
 * @param {Object} state Global state tree
 * @param {number} siteId the site ID
 * @returns {?File} zip file from upload, if any
 */
export default function getPluginUploadFile( state, siteId ) {
	return state.plugins.upload.uploadFile?.[ siteId ] ?? null;
}
