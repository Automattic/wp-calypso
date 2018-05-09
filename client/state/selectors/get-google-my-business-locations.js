/** @format */

/**
 * External dependencies
 */
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteSettings } from 'state/site-settings/selectors';
import { getAvailableExternalAccounts } from 'state/sharing/selectors';

function isConnected( externalUser, siteSettings ) {
	return (
		externalUser.keyringConnectionId === siteSettings.google_my_business_keyring_id &&
		externalUser.ID === siteSettings.google_my_business_location_id
	);
}

export default function getGoogleMyBusinessLocations( state, siteId ) {
	const siteSettings = getSiteSettings( state, siteId );

	if ( ! siteSettings ) {
		return [];
	}

	const externalUsers = filter( getAvailableExternalAccounts( state, 'google_my_business' ), {
		isExternal: true,
	} );

	externalUsers.forEach( externalUser => {
		externalUser.isConnected = isConnected( externalUser, siteSettings );
	} );

	return externalUsers;
}
