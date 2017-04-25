/**
 * External dependencies
 */
import { map, uniq } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSiteSlug } from 'state/sites/selectors';
import { getUpcomingBillingTransactions } from 'state/selectors';

const getSiteSlugsForUpcomingTransactions = createSelector(
	( state ) => {
		const siteIds = uniq( map( getUpcomingBillingTransactions( state ), 'blog_id' ) )
			.map( Number );
		return siteIds.reduce( ( sites, siteId ) => ( {
			...sites,
			[ siteId ]: getSiteSlug( state, siteId ),
		} ), {} );
	},
	( state ) => [
		getUpcomingBillingTransactions( state ),
		state.sites.items,
	]
);

export default getSiteSlugsForUpcomingTransactions;
