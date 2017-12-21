/** @format */

/**
 * External dependencies
 */

import { partition, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSite } from 'state/sites/selectors';
import { getPrimarySiteId, getSitesItems } from 'state/selectors';

const sortByNameAndUrl = list => sortBy( list, [ 'name', 'URL' ] );

/**
 * Get all sites
 *
 * @param {Object} state  Global state tree
 * @return {Array}        Sites objects
 */
export default createSelector(
	state => {
		const primarySiteId = getPrimarySiteId( state );
		const [ primarySite, sites ] = partition( getSitesItems( state ), { ID: primarySiteId } );

		return [ ...primarySite, ...sortByNameAndUrl( sites ) ].map( site =>
			getSite( state, site.ID )
		);
	},
	state => [ getSitesItems( state ), state.currentUser.capabilities ]
);
