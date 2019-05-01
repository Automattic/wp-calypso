/** @format */

/**
 * Internal dependencies
 */
import getCurrentRoute from 'state/selectors/get-current-route';
import { getSiteSlug } from 'state/sites/selectors';

/**
 * Returns the current path with site slug replaced by :site and site Id
 * replaced by :siteid
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?String}        path of site if known
 */
export default function getCurrentPath( state, siteId ) {
	const route = getCurrentRoute( state );
	const slug = getSiteSlug( state, siteId );

	if ( null === route || null === slug ) {
		return null;
	}

	return route.replace( slug, ':site' ).replace( siteId, ':siteid' );
}
