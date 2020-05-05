/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import canJetpackSiteUpdateFiles from './can-jetpack-site-update-files';
import getSiteOption from './get-site-option';
import isJetpackSite from './is-jetpack-site';

/**
 * Determines if a Jetpack site can auto update its files.
 * This function checks if the given Jetpack site can update its files and if the automatic updater is enabled.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {?boolean} true if the site can auto update
 */
export default function canJetpackSiteAutoUpdateFiles( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	if ( ! canJetpackSiteUpdateFiles( state, siteId ) ) {
		return false;
	}

	const fileModDisabled = getSiteOption( state, siteId, 'file_mod_disabled' );

	if ( fileModDisabled && includes( fileModDisabled, 'automatic_updater_disabled' ) ) {
		return false;
	}

	return true;
}
