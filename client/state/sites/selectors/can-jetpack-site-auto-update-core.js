/**
 * Internal dependencies
 */
import canJetpackSiteAutoUpdateFiles from './can-jetpack-site-auto-update-files';

/**
 * Determines if a Jetpack site can auto update WordPress core.
 * This function is currently identical to canJetpackSiteAutoUpdateFiles.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} true if the site can auto update WordPress
 */
export default function canJetpackSiteAutoUpdateCore( state, siteId ) {
	return canJetpackSiteAutoUpdateFiles( state, siteId );
}
