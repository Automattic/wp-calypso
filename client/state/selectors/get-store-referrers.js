/** @format */

/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */

import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import { sortBySales } from 'woocommerce/app/store-stats/referrers/helpers';

export default function( state, { siteId, statType, query, unitSelectedDate, limit, paginate } ) {
	const rawData = getSiteStatsNormalizedData( state, siteId, statType, query );
	const selectedData = find( rawData, d => d.date === unitSelectedDate ) || { data: [] };
	return sortBySales( selectedData.data, limit && ! paginate ? limit : null );
}
