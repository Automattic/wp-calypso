/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { getSiteSettings } from 'state/site-settings/selectors';
import { getKeyringConnectionsByName } from 'state/sharing/keyring/selectors';

function isConnected( keyringConnection, externalUser, siteSettings ) {
	return keyringConnection.ID === siteSettings.google_my_business_keyring_id &&
		externalUser.external_ID === siteSettings.google_my_business_location_id;
}

export default function getGoogleMyBusinessLocations( state, siteId ) {
	const siteSettings = getSiteSettings( state, siteId );

	if ( ! siteSettings ) {
		return [];
	}

	const keyringConnections = getKeyringConnectionsByName( state, 'google_my_business' );
	const locations = [];

	keyringConnections.forEach( keyringConnection => {
		if ( keyringConnection.additional_external_users ) {
			keyringConnection.additional_external_users.forEach( externalUser => {
				locations.push( {
					...keyringConnection,
					keyring_connection_ID: keyringConnection.ID,
					external_ID: externalUser.external_ID,
					external_display: externalUser.external_name,
					isConnected: isConnected( keyringConnection, externalUser, siteSettings ),
				} );
			} );
		}
	} );

	return locations;
}
