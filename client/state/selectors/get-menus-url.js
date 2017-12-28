/** @format */

/**
 * Internal dependencies
 */

import { canCurrentUser } from 'client/state/selectors';
import { isCurrentUserEmailVerified } from 'client/state/current-user/selectors';
import { getSiteAdminUrl, getSiteSlug, isJetpackSite } from 'client/state/sites/selectors';

/**
 * Returns the menus admin URL for the given site ID
 *
 * @param {Object}  state   Global state tree
 * @param {Number}  siteId  A site ID
 * @return {?String}        Menus admin URL
 */
export default function getMenusUrl( state, siteId ) {
	if ( ! canCurrentUser( state, siteId, 'edit_theme_options' ) ) {
		return null;
	}

	if ( isJetpackSite( state, siteId ) ) {
		return getSiteAdminUrl( state, siteId, 'customize.php' ) + '?autofocus[panel]=nav_menus';
	}
	// The Customizer's Menus panel shouldn't be available to users who haven't verified their
	// email yet, so send them to the top-level Customizer where they will (maybe?) see that Menus
	// are not available to them yet. See https://github.com/Automattic/wp-calypso/pull/13017
	if ( ! isCurrentUserEmailVerified( state ) ) {
		return '/customize/' + getSiteSlug( state, siteId );
	}

	return '/customize/menus/' + getSiteSlug( state, siteId );
}
