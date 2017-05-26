/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QuerySiteStats from 'components/data/query-site-stats';
import { getSiteStatsNormalizedData, isRequestingSiteStatsForQuery } from 'state/stats/lists/selectors';

const StatsChart = ( { siteId, query } ) => {
	return (
		<div>
			{ siteId && <QuerySiteStats
				siteId={ siteId }
				statType="statsOrders"
				query={ query }
			/> }
		</div>
	);
};

export default connect(
	( state, { query, siteId } ) => {
		return {
			data: getSiteStatsNormalizedData( state, siteId, 'statsOrders', query ),
			isRequesting: isRequestingSiteStatsForQuery( state, siteId, 'statsOrders', query ),
		};
	}
)( StatsChart );
