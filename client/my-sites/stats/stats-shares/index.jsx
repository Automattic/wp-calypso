import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { useSharingButtonsQuery } from 'calypso/my-sites/marketing/buttons/use-sharing-buttons-query';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsForQuery,
	hasSiteStatsQueryFailed,
} from 'calypso/state/stats/lists/selectors';
import ErrorPanel from '../stats-error';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModulePlaceholder from '../stats-module/placeholder';

const StatShares = ( { siteId, className } ) => {
	const translate = useTranslate();
	const isLoading = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, 'stats' )
	);
	const { data: shareButtons } = useSharingButtonsQuery( siteId );
	const hasError = useSelector( ( state ) => hasSiteStatsQueryFailed( state, siteId, 'stats' ) );
	const siteStats = useSelector( ( state ) => getSiteStatsForQuery( state, siteId, 'stats' ) );

	const data = [];

	if ( siteStats && shareButtons ) {
		shareButtons.forEach( ( service ) => {
			const value = siteStats.stats[ 'shares_' + service.ID ];

			if ( value ) {
				data.push( {
					id: service.ID,
					value,
					label: service.name,
				} );
			}
		} );

		// sort descending
		data.sort( ( a, b ) => b.value - a.value );
	}

	return (
		<>
			{ siteId && <QuerySiteStats siteId={ siteId } statType="stats" /> }
			<StatsListCard
				className={ className }
				moduleType="shares"
				data={ data }
				title={ translate( 'Number of Shares' ) }
				emptyMessage={ translate( 'No shares recorded' ) }
				mainItemLabel=""
				metricLabel=""
				splitHeader
				useShortNumber
				// Shares don't have a summary page yet.
				error={
					( hasError || ( ! isLoading && ! siteStats?.stats?.shares ) ) && (
						<ErrorPanel message={ translate( 'No shares recorded' ) } />
					)
				}
				loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
			/>
		</>
	);
};

export default StatShares;
