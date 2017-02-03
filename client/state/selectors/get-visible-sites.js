/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';

/**
 * Get all visible sites
 *
 * @param {Object} state  Global state tree
 * @return {Array}        Sites objects
 */
export default function getVisibleSites( state ) {
	return Object.values( state.sites.items )
		.filter( site => site.visible === true )
		.map( site => getSite( state, site.ID ) );
}
