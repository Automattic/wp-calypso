/**
 * External dependencies
 */
import { map, uniq } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSite } from 'state/sites/selectors';
import { getUpcomingBillingTransactions } from 'state/selectors';

const getSitesForUpcomingTransactions = createSelector(
	( state ) => {
		const siteIds = uniq( map( getUpcomingBillingTransactions( state ), 'blog_id' ) )
			.map( Number );
		return siteIds.reduce( ( sites, siteId ) => ( {
			...sites,
			[ siteId ]: getSite( state, siteId ),
		} ), {} );
	},
	( state ) => getUpcomingBillingTransactions( state )
);

export default getSitesForUpcomingTransactions;
