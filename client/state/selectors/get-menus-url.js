import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSiteAdminUrl, getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';

/**
 * Returns the menus admin URL for the given site ID
 *
 * @param {Object}  state   Global state tree
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

	return '/customize/menus/' + getSiteSlug( state, siteId );
}
