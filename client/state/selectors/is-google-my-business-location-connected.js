/**
 * External dependencies
 */
import { get, find } from 'lodash';

import { getKeyringConnectionsByName } from 'state/sharing/keyring/selectors';

export default function isGoogleMyBusinessLocationConnected( state, siteId ) {
	const siteKeyrings = get( state, `siteKeyrings.items.${ siteId }`, [] );
	const googleMyBusinessSiteKeyring = find(
		siteKeyrings,
		keyring => keyring.service === 'google_my_business'
	);

	if ( ! googleMyBusinessSiteKeyring ) {
		return false;
	}

	const keyringConnections = getKeyringConnectionsByName( state, 'google_my_business' ).filter(
		keyringConnection => {
			return keyringConnection.ID === googleMyBusinessSiteKeyring.keyring_id;
		}
	);

	if ( keyringConnections.length === 0 ) {
		return false;
	}

	return !! googleMyBusinessSiteKeyring.external_user_id;
}
