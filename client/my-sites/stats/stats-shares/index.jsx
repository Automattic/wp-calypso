import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import SectionHeader from 'calypso/components/section-header';
import { useSharingButtonsQuery } from 'calypso/my-sites/marketing/buttons/use-sharing-buttons-query';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsForQuery,
	hasSiteStatsQueryFailed,
} from 'calypso/state/stats/lists/selectors';
import ErrorPanel from '../stats-error';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';

const StatShares = ( { siteId } ) => {
	const translate = useTranslate();
	const isLoading = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, 'stats' )
	);
	const { data: shareButtons } = useSharingButtonsQuery( siteId );
	const hasError = useSelector( ( state ) => hasSiteStatsQueryFailed( state, siteId, 'stats' ) );
	const siteStats = useSelector( ( state ) => getSiteStatsForQuery( state, siteId, 'stats' ) );
	const classes = [
		'stats-module',
		{
			'is-loading': isLoading,
			'is-showing-error': hasError,
		},
	];

	const isInsightsPageGridEnabled = config.isEnabled( 'stats/insights-page-grid' );
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
			{ isInsightsPageGridEnabled && (
				<StatsListCard
					moduleType="shares"
					data={ data }
					title={ translate( 'Shares' ) }
					emptyMessage={ translate( 'No shares recorded' ) }
					mainItemLabel={ translate( 'Service' ) }
					metricLabel={ translate( 'Total shares' ) }
					splitHeader
					useShortNumber
					// Shares don't have a summary page yet.
					// TODO: limit to 5 items after summary page is added.
					// showMore={ ... }
					error={
						( hasError || ( ! isLoading && ! siteStats?.stats?.shares ) ) && (
							<ErrorPanel message={ translate( 'No shares recorded' ) } />
						)
					}
					loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
				/>
			) }
			{ ! isInsightsPageGridEnabled && (
				<div className="list-shares">
					<SectionHeader label={ translate( 'Shares' ) } />
					<Card className={ classNames( ...classes ) }>
						<StatsTabs borderless>
							{ siteStats &&
								shareButtons &&
								shareButtons.map( ( service ) => {
									let count;
									if ( ( count = siteStats.stats[ 'shares_' + service.ID ] ) ) {
										return (
											<StatsTab
												compact
												key={ service.ID }
												label={ service.name }
												loading={ isLoading }
												value={ count }
											/>
										);
									}
								} ) }
							{ ! isLoading && ! siteStats?.stats?.shares && (
								<ErrorPanel message={ translate( 'No shares recorded' ) } />
							) }
						</StatsTabs>
					</Card>
				</div>
			) }
		</>
	);
};

export default StatShares;
