import 'calypso/state/plugins/init';

/**
 * Returns how the upload on screen was started — 'direct' straight onto the site, 'transfer' as the
 * payload of an Atomic transfer — or null if no upload has been started for this site.
 * @param {Object} state Global state tree
 * @param {number} siteId the site ID
 * @returns {?string} how the upload was started
 */
export default function getPluginUploadMethod( state, siteId ) {
	return state.plugins.upload.uploadMethod?.[ siteId ] ?? null;
}
