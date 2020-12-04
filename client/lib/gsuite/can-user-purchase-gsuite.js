/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import userFactory from 'calypso/lib/user';

/**
 * Determines whether G Suite can be purchased by the user based on their country.
 *
 * @returns {boolean} true if the user is allowed to purchase G Suite, false otherwise
 */
export function canUserPurchaseGSuite() {
	const user = userFactory();

	return get( user.get(), 'is_valid_google_apps_country', false );
}
