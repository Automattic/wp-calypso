/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

const getGoogleMyBusinessLocationId = ( state, siteId ) => {
	return get(
		state,
		`siteSettings.items.${ siteId }.jetpack_google_my_business_location_id`,
		null
	);
};

export default function isGoogleMyBusinessLocationConnected( state, siteId ) {
	return !! getGoogleMyBusinessLocationId( state, siteId );
}
