import { getAvailableExternalAccounts } from 'calypso/state/sharing/selectors';
import { getSiteKeyringsForService } from 'calypso/state/site-keyrings/selectors';

export default function getGoogleMyBusinessLocations( state, siteId ) {
	const googleMyBusinessSiteKeyring = getSiteKeyringsForService(
		state,
		siteId,
		'google_my_business'
	)?.at( -1 );

	if ( ! googleMyBusinessSiteKeyring ) {
		return [];
	}

	const externalUsers = getAvailableExternalAccounts( state, 'google_my_business' ).filter(
		( account ) => account.keyringConnectionId === googleMyBusinessSiteKeyring.keyring_id
	);

	externalUsers.forEach( ( externalUser ) => {
		externalUser.isConnected = externalUser.ID === googleMyBusinessSiteKeyring.external_user_id;
	} );

	return externalUsers;
}
