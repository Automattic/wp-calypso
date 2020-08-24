/**
 * External dependencies
 */
import { filter, last } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteKeyringsForService } from 'state/site-keyrings/selectors';
import { getKeyringConnectionsByName } from 'state/sharing/keyring/selectors';

function isConnected( keyringConnection, externalUser, siteKeyring ) {
	return (
		keyringConnection.ID === siteKeyring.keyring_id &&
		externalUser.external_ID === siteKeyring.external_user_id
	);
}

/**
 * Returns a list of site connections to Google My Business keyring.
 * Given that, in the case of GMB, the id of the keyring connection
 * is stored in the site's settings, there can only be one item in this list.
 * The format of the `connections` returned matches the one returned by
 * `getSiteUserConnectionsForService` used for Publicize services.
 *
 * @param  {object} state  Global state tree
 * @param  {object} siteId The site ID
 * @returns {object}        List of GMB connections for this site
 */
export default function getSiteUserConnectionsForGoogleMyBusiness( state, siteId ) {
	// Google My Business can only have one location connected at a time
	const googleMyBusinessSiteKeyring = last(
		getSiteKeyringsForService( state, siteId, 'google_my_business' )
	);

	if ( ! googleMyBusinessSiteKeyring ) {
		return [];
	}

	const keyringConnections = getKeyringConnectionsByName( state, 'google_my_business' );
	const locations = [];

	keyringConnections.forEach( ( keyringConnection ) => {
		if ( keyringConnection.additional_external_users ) {
			keyringConnection.additional_external_users.forEach( ( externalUser ) => {
				locations.push( {
					...keyringConnection,
					keyring_connection_ID: keyringConnection.ID,
					external_ID: externalUser.external_ID,
					external_display: externalUser.external_name,
					external_profile_picture: externalUser.external_profile_picture,
					isConnected: isConnected( keyringConnection, externalUser, googleMyBusinessSiteKeyring ),
				} );
			} );
		}
	} );

	return filter( locations, { isConnected: true } );
}
