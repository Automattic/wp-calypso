/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';

/**
 * Get all public sites
 *
 * @param {Object} state  Global state tree
 * @return {Array}        Site objects
 */
export default function getPublicSites( state ) {
	return Object.values( state.sites.items )
		.filter( site => ! site.is_private )
		.map( site => getSite( state, site.ID ) );
}
