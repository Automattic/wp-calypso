/**
 * Internal dependencies
 */
import { canCurrentUser } from 'state/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getRawSite } from 'state/sites/selectors';

/**
 * Returns true if the site can be customized by the user, false if the
 * site cannot be customized, or null if customizing ability cannot be
 * determined.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?Boolean}        Whether site is customizable
 */
export default function isSiteCustomizable( state, siteId ) {
	// Cannot determine site customizing ability if there is no current user
	if ( ! getCurrentUserId( state ) || ! getRawSite( state, siteId ) ) {
		return null;
	}

	return canCurrentUser( state, siteId, 'edit_theme_options' );
}
