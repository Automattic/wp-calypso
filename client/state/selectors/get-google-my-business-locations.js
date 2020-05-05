/**
 * External dependencies
 */
import { filter, last } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteKeyringsForService } from 'state/site-keyrings/selectors';
import { getAvailableExternalAccounts } from 'state/sharing/selectors';

export default function getGoogleMyBusinessLocations( state, siteId ) {
	const googleMyBusinessSiteKeyring = last(
		getSiteKeyringsForService( state, siteId, 'google_my_business' )
	);

	if ( ! googleMyBusinessSiteKeyring ) {
		return [];
	}

	const externalUsers = filter( getAvailableExternalAccounts( state, 'google_my_business' ), {
		keyringConnectionId: googleMyBusinessSiteKeyring.keyring_id,
	} );

	externalUsers.forEach( ( externalUser ) => {
		externalUser.isConnected = externalUser.ID === googleMyBusinessSiteKeyring.external_user_id;
	} );

	return externalUsers;
}
