/**
 * Internal dependencies
 */
import canJetpackSiteAutoUpdateFiles from './can-jetpack-site-auto-update-files';

/**
 * Determines if a Jetpack site can auto update WordPress core.
 * This function is currently identical to canJetpackSiteAutoUpdateFiles.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {?boolean} true if the site can auto update WordPress
 */
export default function canJetpackSiteAutoUpdateCore( state, siteId ) {
	return canJetpackSiteAutoUpdateFiles( state, siteId );
}
