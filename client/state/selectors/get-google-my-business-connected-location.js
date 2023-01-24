import { filter, last } from 'lodash';
import getGoogleMyBusinessLocations from 'calypso/state/selectors/get-google-my-business-locations';

/**
 * Returns the Google My Business location/external user the given site
 * is connected to
 *
 * @param  {Object} state  Global state tree
 * @param  {?number} siteId The site ID
 * @returns {Object[]}        A connected GMB location
 */
export default function getGoogleMyBusinessConnectedLocation( state, siteId ) {
	return last(
		filter( getGoogleMyBusinessLocations( state, siteId ), {
			isConnected: true,
		} )
	);
}
