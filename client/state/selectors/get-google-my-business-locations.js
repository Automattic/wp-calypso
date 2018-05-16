/** @format */

/**
 * External dependencies
 */
import { filter, find } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteKeyrings } from 'state/site-keyrings/selectors';
import { getAvailableExternalAccounts } from 'state/sharing/selectors';

function isConnected( externalUser, siteKeyrings ) {
	return (
		externalUser.keyringConnectionId === siteKeyrings.keyring_id &&
		externalUser.ID === siteKeyrings.external_user_id
	);
}

export default function getGoogleMyBusinessLocations( state, siteId ) {
	const siteKeyrings = getSiteKeyrings( state, siteId );

	if ( ! siteKeyrings ) {
		return [];
	}

	const googleMyBusinessSiteKeyring = find(
		siteKeyrings,
		keyring => keyring.service === 'google_my_business'
	);

	const externalUsers = filter( getAvailableExternalAccounts( state, 'google_my_business' ), {
		isExternal: true,
	} );

	externalUsers.forEach( externalUser => {
		externalUser.isConnected = isConnected( externalUser, googleMyBusinessSiteKeyring );
	} );

	return externalUsers;
}
