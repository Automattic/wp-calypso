/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { numberFormat, useTranslate } from 'i18n-calypso';
import { Card } from '@automattic/components';
import { times } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import Chart from 'components/chart';
import QuerySiteStats from 'components/data/query-site-stats';
import InlineSupportLink from 'components/inline-support-link';
import { localizeUrl } from 'lib/i18n-utils';
import { buildChartData } from 'my-sites/stats/stats-chart-tabs/utility';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { getSiteOption } from 'state/sites/selectors';
import { requestChartCounts } from 'state/stats/chart-tabs/actions';
import { getCountRecords, getLoadingTabs } from 'state/stats/chart-tabs/selectors';
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const placeholderChartData = times( 10, () => ( {
	value: Math.random(),
} ) );

export const StatsV2 = ( {
	chartData,
	chartIsLoading,
	chartQuery,
	insightsQuery,
	insightsType,
	isSiteUnlaunched,
	mostPopularDay,
	mostPopularTime,
	siteId,
	siteSlug,
	trafficData,
	trafficStatsType,
	trafficStatsQuery,
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		if ( ! isSiteUnlaunched ) {
			dispatch( requestChartCounts( chartQuery ) );
		}
	}, [ isSiteUnlaunched ] );

	const heading = (
		<h2 className="stats-v2__heading customer-home__section-heading">
			{ translate( 'Stats at a glance' ) }
		</h2>
	);

	if ( isSiteUnlaunched ) {
		return (
			<>
				{ heading }
				<Card className="stats-v2">
					<Chart data={ placeholderChartData } isPlaceholder>
						<div>
							{ translate( 'Launch your site to see a snapshot of traffic and insights.' ) }&nbsp;
							<InlineSupportLink
								supportPostId={ 4454 }
								supportLink={ localizeUrl( 'https://wordpress.com/support/stats/' ) }
								showIcon={ false }
								text={ translate( 'Learn about stats.' ) }
								tracksEvent="calypso_customer_home_stats_support_page_view"
								statsGroup="calypso_customer_home"
								statsName="stats_learn_more"
							/>
						</div>
					</Chart>
				</Card>
			</>
		);
	}

	return (
		<>
			{ heading }
			<Card className="stats-v2">
				<QuerySiteStats
					siteId={ siteId }
					statType={ trafficStatsType }
					query={ trafficStatsQuery }
				/>
				<QuerySiteStats siteId={ siteId } statType={ insightsType } query={ insightsQuery } />
				<CardHeading>{ translate( 'Views' ) }</CardHeading>
				<Chart data={ chartData } loading={ chartIsLoading } />
				<div className="stats-v2__data">
					<div className="stats-v2__data-item">
						<div className="stats-v2__data-label">{ translate( 'Most popular day' ) }</div>
						<div className="stats-v2__data-value">{ mostPopularDay }</div>
					</div>
					<div className="stats-v2__data-item">
						<div className="stats-v2__data-label">{ translate( 'Most popular hour' ) }</div>
						<div className="stats-v2__data-value">{ mostPopularTime ?? '-' }</div>
					</div>
					<div className="stats-v2__data-item">
						<div className="stats-v2__data-label">{ translate( 'Views' ) }</div>
						<div className="stats-v2__data-value">
							{ trafficData?.views ? numberFormat( trafficData.views ) : '-' }
						</div>
					</div>
					<div className="stats-v2__data-item">
						<div className="stats-v2__data-label">{ translate( 'Visitors' ) }</div>
						<div className="stats-v2__data-value">
							{ trafficData?.visitors ? numberFormat( trafficData.visitors ) : '-' }
						</div>
					</div>
				</div>
				<a href={ `/stats/day/${ siteSlug }` } className="stats-v2__all">
					{ translate( 'See all stats' ) }
				</a>
			</Card>
		</>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const isSiteUnlaunched = isUnlaunchedSite( state, siteId );
	const gmtOffset = getSiteOption( state, siteId, 'gmt_offset' );

	const chartTab = 'views';
	const date = moment()
		.utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 )
		.format( 'YYYY-MM-DD' );
	const period = 'day';
	const chartQuery = {
		chartTab,
		date,
		period,
		quantity: 30,
		siteId,
		statFields: [ chartTab ],
	};
	let chartData;
	let chartIsLoading = false;

	let trafficData;
	const trafficStatsType = 'statsVisits';
	const trafficStatsQuery = {
		unit: 'week',
		quantity: 1,
		stat_fields: 'views,visitors',
	};

	let mostPopularDay;
	let mostPopularTime;
	const insightsType = 'statsInsights';
	const insightsQuery = {};

	if ( ! isSiteUnlaunched ) {
		const counts = getCountRecords( state, siteId, period );
		chartData = buildChartData( [], chartTab, counts, period, date );

		const loadingTabs = getLoadingTabs( state, siteId, period );
		chartIsLoading = loadingTabs.includes( chartTab ) && chartData.length === 0;

		/*const trafficStats = getSiteStatsNormalizedData(
			state,
			siteId,
			trafficStatsType,
			trafficStatsQuery
		);
		trafficData = trafficStats && trafficStats.length ? trafficStats[ 0 ] : null;*/

		//showInsights = trafficData && trafficData.views < 10;

		const insightsData = getSiteStatsNormalizedData( state, siteId, insightsType, insightsQuery );
		mostPopularDay = insightsData?.day ?? '-';
		mostPopularTime = insightsData?.hour ?? '-';

		/*
		const isJetpack = isJetpackSite( state, siteId );
		const isStatsModuleActive = isJetpackModuleActive( state, siteId, 'stats' );
		const hideStats =
			(
				isJetpack && ! isStatsModuleActive
			) || (
				showInsights && ! insightsData?.percent
			);*/
	}

	return {
		chartData,
		chartIsLoading,
		chartQuery,
		insightsQuery,
		insightsType,
		isSiteUnlaunched,
		mostPopularDay,
		mostPopularTime,
		siteId,
		siteSlug,
		trafficData,
		trafficStatsQuery,
		trafficStatsType,
	};
};

export default connect( mapStateToProps )( StatsV2 );
