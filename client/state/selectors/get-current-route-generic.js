import { getSiteFragment } from 'calypso/lib/route';
import getCurrentRoute from './get-current-route';

/**
 * Gets the last route set by a ROUTE_SET actionand replaces the siteFragment with ":site"
 * @param {Object} state - global redux state
 * @returns {string} current route value
 */
export const getCurrentRouteGeneric = ( state ) => {
	const currentPath = getCurrentRoute( state );
	const siteFragment = getSiteFragment( currentPath );
	if ( ! siteFragment ) {
		return currentPath;
	}
	return currentPath.replace( siteFragment, ':site' );
};

export default getCurrentRoute;
