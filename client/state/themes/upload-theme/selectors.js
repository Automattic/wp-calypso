/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if a theme upload is in progress.
 *
 * @param {Object} state -- Global state tree
 * @param {Number} siteId -- Site ID
 * @return {Boolean} -- True if upload is in progress
 */
export function isUploadInProgress( state, siteId ) {
	return get( state.themes.uploadTheme.inProgress, siteId, false );
}

/**
 * Returns true if a theme upload has finished successfully.
 *
 * @param {Object} state -- Global state tree
 * @param {Number} siteId -- Site ID
 * @return {Boolean} -- True if upload has completed
 */
export function isUploadComplete( state, siteId ) {
	return !! (
		( ! isUploadInProgress( state, siteId ) ) &&
		getUploadedThemeId( state, siteId )
	);
}

/**
 * Returns true if a theme upload has failed
 *
 * @param {Object} state -- Global state tree
 * @param {Number} siteId -- Site ID
 * @return {Boolean} -- True if upload has failed
 */
export function hasUploadFailed( state, siteId ) {
	return !! get( state.themes.uploadTheme.uploadError, siteId, false );
}

/**
 * Returns the ID of a successfully uploaded theme.
 *
 * @param {Object} state -- Global state tree
 * @param {Number} siteId -- Site ID
 * @return {?string} -- Uploaded theme ID
 */
export function getUploadedThemeId( state, siteId ) {
	const themeId = get( state.themes.uploadTheme.uploadedThemeId, siteId );
	// When wpcom themes are uploaded, we will not be able to retrieve details
	// from the site, since we filter out all wpcom themes. Remove the suffix
	// so we can use details from wpcom.
	if ( themeId ) {
		return themeId.replace( /-wpcom$/, '' );
	}
	return null;
}

/**
 * Returns the error for a failed theme upload.
 *
 * @param {Object} state -- Global state tree
 * @param {Number} siteId -- Site ID
 * @return {?Object} -- Error details
 */
export function getUploadError( state, siteId ) {
	return get( state.themes.uploadTheme.uploadError, siteId );
}

/**
 * Returns the total size of a theme to be uploaded.
 *
 * @param {Object} state -- Global state tree
 * @param {Number} siteId -- Site ID
 * @return {?Number} -- Total
 */
export function getUploadProgressTotal( state, siteId ) {
	return get( state.themes.uploadTheme.progressTotal, siteId );
}

/**
 * Returns the amount of theme currently uploaded. Compare
 * with the total.
 *
 * @param {Object} state -- Global state tree
 * @param {Number} siteId -- Site ID
 * @return {?Number} -- Loaded
 */
export function getUploadProgressLoaded( state, siteId ) {
	return get( state.themes.uploadTheme.progressLoaded, siteId );
}

/**
 * Returns true if the upload of a theme has completed but the
 * theme installation on the target site has not yet finished.
 *
 * @param {Object} state -- Global state tree
 * @param {Number} siteId -- Site ID
 * @return {Boolean} -- True install is in progress
 */
export function isInstallInProgress( state, siteId ) {
	return getUploadProgressTotal( state, siteId ) ===
		getUploadProgressLoaded( state, siteId );
}
