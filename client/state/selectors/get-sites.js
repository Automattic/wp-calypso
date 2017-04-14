/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';

/**
 * Get all sites
 *
 * @param {Object} state  Global state tree
 * @return {Array}        Sites objects
 */
export default function getSites( state ) {
	return Object.values( state.sites.items )
		.map( site => getSite( state, site.ID ) );
}
