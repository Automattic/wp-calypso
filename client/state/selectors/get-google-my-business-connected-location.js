/**
 * External dependencies
 */
import { filter, last } from 'lodash';

/**
 * Internal dependencies
 */
import { getGoogleMyBusinessLocations } from 'state/selectors';

export default function getGoogleMyBusinessConnectedLocation( state, siteId ) {
	return last( filter( getGoogleMyBusinessLocations( state, siteId ), {
		isConnected: true,
	} ) );
}
