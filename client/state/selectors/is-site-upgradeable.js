import { canCurrentUser } from 'calypso/state/selectors/can-current-user';

/**
 * Returns true if the site can be upgraded by the user, false if the
 * site cannot be upgraded, or null if upgrade ability cannot be
 * determined.
 *
 * @param  {Object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether site is upgradeable
 */
export default function isSiteUpgradeable( state, siteId ) {
	return canCurrentUser( state, siteId, 'manage_options' );
}
