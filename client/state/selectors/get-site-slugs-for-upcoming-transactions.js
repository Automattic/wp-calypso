/** @format */

/**
 * External dependencies
 */

import { compact, map, uniq } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'client/lib/create-selector';
import { getSiteSlug } from 'client/state/sites/selectors';
import { getUpcomingBillingTransactions } from 'client/state/selectors';

/**
 * Returns the slugs of all sites that are included in upcoming transactions, indexed by the site IDs.
 * Sites that are not loaded yet are intentionally skipped.
 *
 * @param  {Object}   state   Global state tree
 * @return {Object}           Site slugs, indexed by site ID
 */
const getSiteSlugsForUpcomingTransactions = createSelector(
	state => {
		const siteIds = compact(
			uniq( map( getUpcomingBillingTransactions( state ), 'blog_id' ) )
		).map( Number );
		return siteIds.reduce( ( sites, siteId ) => {
			const result = { ...sites };
			const slug = getSiteSlug( state, siteId );
			if ( slug ) {
				result[ siteId ] = slug;
			}
			return result;
		}, {} );
	},
	state => [ getUpcomingBillingTransactions( state ), state.sites.items ]
);

export default getSiteSlugsForUpcomingTransactions;
