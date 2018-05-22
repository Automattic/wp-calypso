/** @format */

/**
 * External dependencies
 */
import { get, find } from 'lodash';

const getGoogleMyBusinessLocationId = ( state, siteId ) => {
	const siteKeyrings = get( state, `siteKeyrings.items.${ siteId }`, [] );
	const googleMyBusinessSiteKeyring = find(
		siteKeyrings,
		keyring => keyring.service === 'google_my_business'
	);

	return googleMyBusinessSiteKeyring ? googleMyBusinessSiteKeyring.external_user_id : undefined;
};

export default function isGoogleMyBusinessLocationConnected( state, siteId ) {
	return !! getGoogleMyBusinessLocationId( state, siteId );
}
