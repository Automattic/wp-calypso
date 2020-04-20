/**
 * External dependencies
 */
import { every } from 'lodash';

/**
 * Internal dependencies
 */
import isJetpackModuleActive from './is-jetpack-module-active';
import isJetpackSite from './is-jetpack-site';

/**
 * Determines if all given modules are active for a Jetpack Site.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @param {Array} moduleIds A list of active module ids to verify
 * @returns {?boolean} true if the all the given modules are active for this site
 */
export default function verifyJetpackModulesActive( state, siteId, moduleIds ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	if ( ! Array.isArray( moduleIds ) ) {
		moduleIds = [ moduleIds ];
	}

	return every( moduleIds, ( moduleId ) => isJetpackModuleActive( state, siteId, moduleId ) );
}
