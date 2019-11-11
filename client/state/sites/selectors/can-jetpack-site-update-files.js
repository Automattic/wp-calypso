/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteOption from './get-site-option';
import isJetpackSite from './is-jetpack-site';
import isJetpackSiteSecondaryNetworkSite from './is-jetpack-site-secondary-network-site';
import siteHasMinimumJetpackVersion from './site-has-minimum-jetpack-version';

/**
 * Determines if a Jetpack site can update its files.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} true if the site can update its file
 */
export default function canJetpackSiteUpdateFiles( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	if ( ! siteHasMinimumJetpackVersion( state, siteId ) ) {
		return false;
	}

	const isMultiNetwork = getSiteOption( state, siteId, 'is_multi_network' );

	if ( isMultiNetwork ) {
		return false;
	}

	if ( isJetpackSiteSecondaryNetworkSite( state, siteId ) ) {
		return false;
	}

	const fileModDisabled = getSiteOption( state, siteId, 'file_mod_disabled' );

	if ( ! fileModDisabled ) {
		return true;
	}

	return (
		! includes( fileModDisabled, 'disallow_file_mods' ) &&
		! includes( fileModDisabled, 'has_no_file_system_write_access' )
	);
}
