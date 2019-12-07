/**
 * Internal dependencies
 */
import getCurrentRoute from 'state/selectors/get-current-route';
import { getSiteSlug } from 'state/sites/selectors';

/**
 * Returns the current route with site slug replaced by :site and site Id
 * replaced by :siteid. Note that other parameters such as :domain are not currently
 * supported.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?String}        The current route with site parameters
 */
export default function getCurrentRouteParameterized( state, siteId ) {
	const route = getCurrentRoute( state );
	const slug = getSiteSlug( state, siteId );

	if ( null === route || null === slug ) {
		return null;
	}

	return route.replace( slug, ':site' ).replace( siteId, ':siteid' );
}
