/**
 * Internal dependencies
 */
import versionCompare from 'lib/version-compare';
import getSiteOption from './get-site-option';
import isJetpackModuleActive from './is-jetpack-module-active';

/**
 * Determines if a Jetpack site has opted in for full-site management.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {?boolean} if the site can be managed from calypso
 */
export default function canJetpackSiteManage( state, siteId ) {
	// for versions 3.4 and higher, canManage can be determined by the state of the Manage Module
	const siteJetpackVersion = getSiteOption( state, siteId, 'jetpack_version' );

	if ( ! siteJetpackVersion ) {
		return null;
	}

	// Since Jetpack 7.3, Manage is no longer a module and is baked directly into Jetpack. All will be "Manageable "
	if ( versionCompare( siteJetpackVersion, '7.3-alpha', '>=' ) ) {
		return true;
	}

	if ( versionCompare( siteJetpackVersion, '3.4', '>=' ) ) {
		// if we haven't fetched the modules yet, we default to true
		const isModuleActive = isJetpackModuleActive( state, siteId, 'manage' );
		return isModuleActive === null ? true : isModuleActive;
	}
	// for version lower than 3.4, we cannot not determine canManage, we'll assume they can
	return true;
}
