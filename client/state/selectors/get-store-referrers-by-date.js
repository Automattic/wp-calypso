import { find } from 'lodash';
import { sortBySales } from 'calypso/my-sites/store/app/store-stats/referrers/helpers';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';

import 'calypso/state/stats/init';

export default function ( state, { siteId, statType, query, endSelectedDate, limit, paginate } ) {
	const rawData = getSiteStatsNormalizedData( state, siteId, statType, query );
	const selectedData = find( rawData, ( d ) => d.date === endSelectedDate ) || { data: [] };
	return sortBySales( selectedData.data, limit && ! paginate ? limit : null );
}
