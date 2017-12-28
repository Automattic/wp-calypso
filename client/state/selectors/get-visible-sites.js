/** @format */

/**
 * Internal dependencies
 */

import { getSite } from 'client/state/sites/selectors';
import { getSitesItems } from 'client/state/selectors';
import createSelector from 'client/lib/create-selector';

/**
 * Get all visible sites
 *
 * @param {Object} state  Global state tree
 * @return {Array}        Sites objects
 */
export default createSelector(
	state =>
		Object.values( getSitesItems( state ) )
			.filter( site => site.visible === true )
			.map( site => getSite( state, site.ID ) ),
	state => [ getSitesItems( state ) ]
);
