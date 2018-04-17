/**
 * External dependencies
 */
import { filter, last } from 'lodash';

/**
 * Internal dependencies
 */
import { getGoogleMyBusinessLocations } from 'state/selectors';

/**
 * Returns the Google My Business location/external user the given site
 * is connected to
 *
 * @param  {Object} state  Global state tree
 * @param  {Object} siteId The site ID
 * @return {Object}        A connected GMB location
 */
export default function getGoogleMyBusinessConnectedLocation( state, siteId ) {
	return last( filter( getGoogleMyBusinessLocations( state, siteId ), {
		isConnected: true,
	} ) );
}
