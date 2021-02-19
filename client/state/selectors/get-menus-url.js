/**
 * Internal dependencies
 */

import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { getSiteAdminUrl, getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';

/**
 * Returns the menus admin URL for the given site ID
 *
 * @param {object}  state   Global state tree
 * @param {number}  siteId  A site ID
 * @returns {?string}        Menus admin URL
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
