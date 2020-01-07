/**
 * External dependencies
 */
import { filter, last } from 'lodash';

/**
 * Internal dependencies
 */
import getGoogleMyBusinessLocations from 'state/selectors/get-google-my-business-locations';

/**
 * Returns the Google My Business location/external user the given site
 * is connected to
 *
 * @param  {object} state  Global state tree
 * @param  {object} siteId The site ID
 * @returns {object}        A connected GMB location
 */
export default function getGoogleMyBusinessConnectedLocation( state, siteId ) {
	return last(
		filter( getGoogleMyBusinessLocations( state, siteId ), {
			isConnected: true,
		} )
	);
}
