import { getCurrentUser } from 'calypso/state/current-user/selectors';

/**
 * Determines whether G Suite can be purchased by the user based on their country.
 *
 * @param {Object} state Global state tree
 * @returns {boolean} true if the user is allowed to purchase G Suite, false otherwise
 */
export default function canUserPurchaseGSuite( state ) {
	const user = getCurrentUser( state );
	return user?.is_valid_google_apps_country ?? false;
}
