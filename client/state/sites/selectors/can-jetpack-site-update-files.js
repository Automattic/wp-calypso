/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteOption from 'state/sites/selectors/get-site-option';
import isJetpackSite from 'state/sites/selectors/is-jetpack-site';
import isJetpackSiteSecondaryNetworkSite from 'state/sites/selectors/is-jetpack-site-secondary-network-site';

import 'state/sites/init';

/**
 * Determines if a Jetpack site can update its files.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param   {object}   state  Global state tree
 * @param   {number}   siteId Site ID
 * @returns {?boolean}        True if the site can update its file
 */
export default function canJetpackSiteUpdateFiles( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
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
