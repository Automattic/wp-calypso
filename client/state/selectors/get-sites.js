/**
 * External dependencies
 */

import { partition, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSite } from 'state/sites/selectors';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import getSitesItems from 'state/selectors/get-sites-items';

const sortByNameAndUrl = ( list ) => sortBy( list, [ 'name', 'URL' ] );

/**
 * Get all sites
 *
 * @param {object} state  Global state tree
 * @returns {Array}        Sites objects
 */
export default createSelector(
	( state ) => {
		const primarySiteId = getPrimarySiteId( state );
		const [ primarySite, sites ] = partition( getSitesItems( state ), { ID: primarySiteId } );

		return [ ...primarySite, ...sortByNameAndUrl( sites ) ].map( ( site ) =>
			getSite( state, site.ID )
		);
	},
	( state ) => [ getSitesItems( state ), state.currentUser.capabilities ]
);
