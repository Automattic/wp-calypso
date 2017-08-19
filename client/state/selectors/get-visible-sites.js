/** @format */

/**
 * Internal dependencies
 */

import { getSite } from 'state/sites/selectors';
import { getSitesItems } from 'state/selectors';

/**
 * Get all visible sites
 *
 * @param {Object} state  Global state tree
 * @return {Array}        Sites objects
 */
export default state =>
	Object.values( getSitesItems( state ) )
		.filter( site => site.visible === true )
		.map( site => getSite( state, site.ID ) );
