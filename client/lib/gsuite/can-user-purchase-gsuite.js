/**
 * Internal dependencies
 */
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { reduxGetState } from 'calypso/lib/redux-bridge';

/**
 * Determines whether G Suite can be purchased by the user based on their country.
 *
 * @returns {boolean} true if the user is allowed to purchase G Suite, false otherwise
 */
export function canUserPurchaseGSuite() {
	const user = getCurrentUser( reduxGetState() );
	return user?.is_valid_google_apps_country ?? false;
}
