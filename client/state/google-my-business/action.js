/** @format */

/**
 * Internal dependencies
 */
import { GOOGLE_MY_BUSINESS_CONNECT_LOCATION } from 'state/action-types';

export const connectGoogleMyBusinessLocation = ( siteId, locationId ) => ( {
	type: GOOGLE_MY_BUSINESS_CONNECT_LOCATION,
	siteId,
	locationId,
} );
