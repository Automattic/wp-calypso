/** @format */

/**
 * External dependencies
 */
import { last } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteKeyringsForService } from 'state/site-keyrings/selectors';
import { getKeyringConnectionsByName } from 'state/sharing/keyring/selectors';

/**
 * Returns a list of site connections to Google My Business keyring.
 * Given that, in the case of GMB, the id of the keyring connection
 * is stored in the site's settings, there can only be one item in this list.
 * The format of the `connections` returned matches the one returned by
 * `getSiteUserConnectionsForService` used for Publicize services.
 *
 * @param  {Object} state  Global state tree
 * @param  {Object} siteId The site ID
 * @return {Object}        List of GMB connections for this site
 */
export default function getSiteUserConnectionsForGoogleDrive( state, siteId ) {
	// Google My Business can only have one location connected at a time
	const googleDriveSiteKeyring = last( getSiteKeyringsForService( state, siteId, 'google_drive' ) );

	if ( ! googleDriveSiteKeyring ) {
		return [];
	}

	const keyringConnections = getKeyringConnectionsByName( state, 'google_drive' );

	return keyringConnections.filter( keyringConnection => {
		return keyringConnection.ID === googleDriveSiteKeyring.keyring_id;
	} );
}
