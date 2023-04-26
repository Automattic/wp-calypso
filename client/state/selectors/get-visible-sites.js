import { createSelector } from '@automattic/state-utils';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { getSite } from 'calypso/state/sites/selectors';

/**
 * Get all visible sites
 *
 * @param {Object} state  Global state tree
 * @returns {Array}        Sites objects
 */
export default createSelector(
	( state ) =>
		Object.values( getSitesItems( state ) )
			.filter( ( site ) => site.visible === true )
			.map( ( site ) => getSite( state, site.ID ) ),
	( state ) => [ getSitesItems( state ) ]
);
