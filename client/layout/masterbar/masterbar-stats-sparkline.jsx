import { createSelector } from '@automattic/state-utils';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { StatsSparkline } from 'calypso/dashboard/components/stats-sparkline';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';

const getHourlyViews = createSelector(
	( state, siteId ) => {
		const statsInsights = getSiteStatsNormalizedData( state, siteId, 'statsInsights' );
		return statsInsights.hourlyViews ? Object.values( statsInsights.hourlyViews ) : null;
	},
	( state, siteId ) => getSiteStatsNormalizedData( state, siteId, 'statsInsights' )
);

/**
 * @param {{ siteId?: number }} props
 */
export default function MasterbarStatsSparkline( { siteId } ) {
	const hourlyViews = useSelector( ( state ) => getHourlyViews( state, siteId ) );

	return (
		<>
			<QuerySiteStats siteId={ siteId } statType="statsInsights" />
			{ hourlyViews && hourlyViews.length > 0 && <StatsSparkline hourlyViews={ hourlyViews } /> }
		</>
	);
}
