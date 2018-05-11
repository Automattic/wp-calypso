/** @format */

/**
 * External dependencies
 */
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteKeyrings } from 'state/site-keyrings/selectors';
import { getAvailableExternalAccounts } from 'state/sharing/selectors';

function isConnected( externalUser, siteKeyrings ) {
	return (
		externalUser.keyringConnectionId === siteKeyrings.google_my_business_keyring_id &&
		externalUser.ID === siteKeyrings.google_my_business_location_id
	);
}

export default function getGoogleMyBusinessLocations( state, siteId ) {
	const siteKeyrings = getSiteKeyrings( state, siteId );

	if ( ! siteKeyrings ) {
		return [];
	}

	const externalUsers = filter( getAvailableExternalAccounts( state, 'google_my_business' ), {
		isExternal: true,
	} );

	externalUsers.forEach( externalUser => {
		externalUser.isConnected = isConnected( externalUser, siteKeyrings );
	} );

	return externalUsers;
}
