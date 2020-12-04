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
import CardHeading from 'calypso/components/card-heading';
import Chart from 'calypso/components/chart';
import Spinner from 'calypso/components/spinner';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { preventWidows } from 'calypso/lib/formatting';
import { buildChartData } from 'calypso/my-sites/stats/stats-chart-tabs/utility';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { requestChartCounts } from 'calypso/state/stats/chart-tabs/actions';
import { getCountRecords, getLoadingTabs } from 'calypso/state/stats/chart-tabs/selectors';
import {
	getMostPopularDatetime,
	getTopPostAndPage,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const placeholderChartData = times( 7, () => ( {
	value: Math.random(),
} ) );

export const StatsV2 = ( {
	chartData,
	chartQuery,
	insightsQuery,
	isLoading,
	isSiteUnlaunched,
	mostPopularDay,
	mostPopularTime,
	siteCreatedAt,
	siteId,
	siteSlug,
	topPage,
	topPost,
	topPostsQuery,
	views,
	visitors,
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const showTopPost = !! topPost;
	const showTopPage = !! topPage;
	const showViews = ! showTopPost || ! showTopPage;
	const showVisitors = ! showTopPost && ! showTopPage;

	useEffect( () => {
		if ( ! isSiteUnlaunched ) {
			dispatch( requestChartCounts( chartQuery ) );
		}
	}, [ isSiteUnlaunched ] );

	const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
	const siteOlderThanAWeek = Date.now() - new Date( siteCreatedAt ).getTime() > WEEK_IN_MS;
	const statsPlaceholderMessage = siteOlderThanAWeek
		? translate( "No traffic this week, but don't give up!" )
		: translate( "No traffic yet, but you'll get there!" );

	return (
		<div className="stats">
			{ ! isSiteUnlaunched && (
				<>
					<QuerySiteStats siteId={ siteId } statType="statsInsights" query={ insightsQuery } />
					<QuerySiteStats siteId={ siteId } statType="statsTopPosts" query={ topPostsQuery } />
				</>
			) }
			<h2 className="stats__heading customer-home__section-heading">
				{ translate( 'Stats at a glance' ) }
			</h2>
			<Card>
				{ isSiteUnlaunched && (
					<Chart data={ placeholderChartData } isPlaceholder>
						<div>
							{ translate( 'Launch your site to see a snapshot of traffic and insights.' ) }
							<InlineSupportLink
								supportPostId={ 4454 }
								supportLink={ localizeUrl( 'https://wordpress.com/support/stats/' ) }
								showIcon={ false }
								tracksEvent="calypso_customer_home_stats_support_page_view"
								statsGroup="calypso_customer_home"
								statsName="stats_learn_more"
							>
								{ preventWidows( translate( 'Learn about stats.' ) ) }
							</InlineSupportLink>
						</div>
					</Chart>
				) }
				{ ! isSiteUnlaunched && ( isLoading || views === 0 ) && (
					<Chart data={ placeholderChartData } isPlaceholder>
						{ isLoading ? <Spinner /> : statsPlaceholderMessage }
					</Chart>
				) }
				{ ! isSiteUnlaunched && ! isLoading && views === 0 && (
					<div className="stats__empty">
						<div className="stats__empty-illustration">
							<img src="/calypso/images/stats/illustration-stats-intro.svg" alt="" />
						</div>
						<div className="stats__empty-text">
							{ translate(
								'Stats can help you optimize for the right keywords, and feature content your readers are interested in.'
							) }
							<InlineSupportLink
								supportPostId={ 4454 }
								supportLink={ localizeUrl( 'https://wordpress.com/support/stats/' ) }
								showIcon={ false }
								tracksEvent="calypso_customer_home_stats_support_page_view"
								statsGroup="calypso_customer_home"
								statsName="stats_learn_more"
							>
								{ translate( 'Read more.' ) }
							</InlineSupportLink>
						</div>
					</div>
				) }
				{ ! isSiteUnlaunched && ! isLoading && views > 0 && (
					<>
						<CardHeading>{ translate( 'Views' ) }</CardHeading>
						<Chart data={ chartData } />
						<div className="stats__data">
							<div className="stats__data-item">
								<div className="stats__data-label">{ translate( 'Most popular day' ) }</div>
								<div className="stats__data-value">{ mostPopularDay }</div>
							</div>
							<div className="stats__data-item">
								<div className="stats__data-label">{ translate( 'Most popular hour' ) }</div>
								<div className="stats__data-value">{ mostPopularTime ?? '-' }</div>
							</div>
							{ showTopPost && (
								<div className="stats__data-item">
									<div className="stats__data-label">{ translate( 'Top post' ) }</div>
									<div className="stats__data-value">{ topPost.title }</div>
								</div>
							) }
							{ showTopPage && (
								<div className="stats__data-item">
									<div className="stats__data-label">{ translate( 'Top page' ) }</div>
									<div className="stats__data-value">{ topPage.title }</div>
								</div>
							) }
							{ showViews && (
								<div className="stats__data-item">
									<div className="stats__data-label">{ translate( 'Total views' ) }</div>
									<div className="stats__data-value">{ numberFormat( views ) }</div>
								</div>
							) }
							{ showVisitors && (
								<div className="stats__data-item">
									<div className="stats__data-label">{ translate( 'Total visitors' ) }</div>
									<div className="stats__data-value">{ numberFormat( visitors ) }</div>
								</div>
							) }
						</div>
						<a href={ `/stats/day/${ siteSlug }` } className="stats__all">
							{ translate( 'See all stats' ) }
						</a>
					</>
				) }
			</Card>
		</div>
	);
};

const getStatsQueries = ( state, siteId ) => {
	const period = 'day';
	const quantity = 7;

	const gmtOffset = getSiteOption( state, siteId, 'gmt_offset' );
	const date = moment()
		.utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 )
		.format( 'YYYY-MM-DD' );

	const chartQuery = {
		chartTab: 'views',
		date,
		period,
		quantity,
		siteId,
		statFields: [ 'views' ],
	};

	const insightsQuery = {};

	const topPostsQuery = {
		date,
		num: quantity,
		period,
	};

	const visitsQuery = {
		unit: period,
		quantity: quantity,
		stat_fields: 'views,visitors',
	};

	return {
		chartQuery,
		insightsQuery,
		topPostsQuery,
		visitsQuery,
	};
};

const getStatsData = ( state, siteId, chartQuery, insightsQuery, topPostsQuery ) => {
	const counts = getCountRecords( state, siteId, chartQuery.period );
	const chartData = buildChartData(
		[],
		chartQuery.chartTab,
		counts,
		chartQuery.period,
		chartQuery.date
	);
	const views = chartData.reduce(
		( acummulatedViews, { data } ) => acummulatedViews + data.views,
		0
	);
	const visitors = chartData.reduce(
		( acummulatedVisitors, { data } ) => acummulatedVisitors + data.visitors,
		0
	);

	const { day: mostPopularDay, time: mostPopularTime } = getMostPopularDatetime(
		state,
		siteId,
		insightsQuery
	);

	const { post: topPost, page: topPage } = getTopPostAndPage( state, siteId, topPostsQuery );

	return {
		chartData,
		mostPopularDay,
		mostPopularTime,
		topPost,
		topPage,
		views,
		visitors,
	};
};

const isLoadingStats = ( state, siteId, chartQuery, insightsQuery, topPostsQuery ) =>
	getLoadingTabs( state, siteId, chartQuery.period ).includes( chartQuery.chartTab ) ||
	isRequestingSiteStatsForQuery( state, siteId, 'statsInsights', insightsQuery ) ||
	isRequestingSiteStatsForQuery( state, siteId, 'statsTopPosts', topPostsQuery );

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const isSiteUnlaunched = isUnlaunchedSite( state, siteId );
	const siteCreatedAt = getSiteOption( state, siteId, 'created_at' );

	const { chartQuery, insightsQuery, topPostsQuery, visitsQuery } = getStatsQueries(
		state,
		siteId
	);

	const isLoading = isLoadingStats(
		state,
		siteId,
		chartQuery.chartTab,
		chartQuery.period,
		insightsQuery,
		topPostsQuery,
		visitsQuery
	);

	const canShowStatsData = ! isSiteUnlaunched && ! isLoading;
	const statsData =
		canShowStatsData &&
		getStatsData( state, siteId, chartQuery, insightsQuery, topPostsQuery, visitsQuery );

	return {
		chartQuery,
		insightsQuery,
		isLoading: canShowStatsData ? statsData.chartData.length !== chartQuery.quantity : isLoading,
		isSiteUnlaunched,
		siteCreatedAt,
		siteId,
		siteSlug,
		topPostsQuery,
		visitsQuery,
		...statsData,
	};
};

export default connect( mapStateToProps )( StatsV2 );
