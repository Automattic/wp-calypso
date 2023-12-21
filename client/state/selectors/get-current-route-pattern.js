import { getSiteFragment } from 'calypso/lib/route';
import getCurrentRoute from './get-current-route';

/**
 * Retrieves the last route set by a ROUTE_SET action and replaces
 * the siteFragment with ":site". Unlike getCurrentRouteParameterized,
 * this function does not require the siteId. As a result, it can
 * return the current route even if the user has no site.
 * @param {Object} state - Global Redux state
 * @returns {?string}      The current route with site parameters
 */

export const getCurrentRoutePattern = ( state ) => {
	const currentPath = getCurrentRoute( state );
	if ( ! currentPath ) {
		return null;
	}
	const siteFragment = getSiteFragment( currentPath );
	if ( ! siteFragment ) {
		return currentPath;
	}
	return currentPath.replace( siteFragment, ':site' );
};

export default getCurrentRoutePattern;
