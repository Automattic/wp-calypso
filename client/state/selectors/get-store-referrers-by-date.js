/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import { sortBySales } from 'woocommerce/app/store-stats/referrers/helpers';

import 'state/stats/init';

export default function ( state, { siteId, statType, query, endSelectedDate, limit, paginate } ) {
	const rawData = getSiteStatsNormalizedData( state, siteId, statType, query );
	const selectedData = find( rawData, ( d ) => d.date === endSelectedDate ) || { data: [] };
	return sortBySales( selectedData.data, limit && ! paginate ? limit : null );
}
