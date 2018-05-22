/** @format */

/**
 * External dependencies
 */
import { filter, last } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteKeyringsForService } from 'state/site-keyrings/selectors';
import { getAvailableExternalAccounts } from 'state/sharing/selectors';

function isConnected( externalUser, siteKeyring ) {
	return (
		externalUser.keyringConnectionId === siteKeyring.keyring_id &&
		externalUser.ID === siteKeyring.external_user_id
	);
}

export default function getGoogleMyBusinessLocations( state, siteId ) {
	// Google My Business can only have one location connected at a time
	const googleMyBusinessSiteKeyring =
		last( getSiteKeyringsForService( state, siteId, 'google_my_business' ) ) || {};

	const externalUsers = filter( getAvailableExternalAccounts( state, 'google_my_business' ), {
		isExternal: true,
	} );

	externalUsers.forEach( externalUser => {
		externalUser.isConnected = isConnected( externalUser, googleMyBusinessSiteKeyring );
	} );

	return externalUsers;
}
