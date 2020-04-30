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
import Spinner from 'components/spinner';
import QuerySiteStats from 'components/data/query-site-stats';
import InlineSupportLink from 'components/inline-support-link';
import { localizeUrl } from 'lib/i18n-utils';
import { buildChartData } from 'my-sites/stats/stats-chart-tabs/utility';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { getSiteOption } from 'state/sites/selectors';
import { requestChartCounts } from 'state/stats/chart-tabs/actions';
import { getCountRecords, getLoadingTabs } from 'state/stats/chart-tabs/selectors';
import {
	getMostPopularDatetime,
	getTopPostAndPage,
	isRequestingSiteStatsForQuery,
} from 'state/stats/lists/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

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

	return (
		<div className="stats-v2">
			{ ! isSiteUnlaunched && (
				<>
					<QuerySiteStats siteId={ siteId } statType="statsInsights" query={ insightsQuery } />
					<QuerySiteStats siteId={ siteId } statType="statsTopPosts" query={ topPostsQuery } />
				</>
			) }
			<h2 className="stats-v2__heading customer-home__section-heading">
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
								text={ translate( 'Learn about stats.' ) }
								tracksEvent="calypso_customer_home_stats_support_page_view"
								statsGroup="calypso_customer_home"
								statsName="stats_learn_more"
							/>
						</div>
					</Chart>
				) }
				{ ! isSiteUnlaunched && ( isLoading || views === 0 ) && (
					<Chart data={ placeholderChartData } isPlaceholder>
						{ isLoading ? <Spinner /> : translate( "No traffic this week, but don't give up!" ) }
					</Chart>
				) }
				{ ! isSiteUnlaunched && ! isLoading && views === 0 && (
					<div className="stats-v2__empty">
						<div className="stats-v2__empty-illustration">
							<img src="/calypso/images/stats/illustration-stats-intro.svg" alt="" />
						</div>
						<div className="stats-v2__empty-text">
							{ translate(
								'Stats can help you optimize for the right keywords, and feature content your readers are interested in.'
							) }
							<InlineSupportLink
								supportPostId={ 4454 }
								supportLink={ localizeUrl( 'https://wordpress.com/support/stats/' ) }
								showIcon={ false }
								text={ translate( 'Read more.' ) }
								tracksEvent="calypso_customer_home_stats_support_page_view"
								statsGroup="calypso_customer_home"
								statsName="stats_learn_more"
							/>
						</div>
					</div>
				) }
				{ ! isSiteUnlaunched && ! isLoading && views > 0 && (
					<>
						<CardHeading>{ translate( 'Views' ) }</CardHeading>
						<Chart data={ chartData } />
						<div className="stats-v2__data">
							<div className="stats-v2__data-item">
								<div className="stats-v2__data-label">{ translate( 'Most popular day' ) }</div>
								<div className="stats-v2__data-value">{ mostPopularDay }</div>
							</div>
							<div className="stats-v2__data-item">
								<div className="stats-v2__data-label">{ translate( 'Most popular hour' ) }</div>
								<div className="stats-v2__data-value">{ mostPopularTime ?? '-' }</div>
							</div>
							{ showTopPost && (
								<div className="stats-v2__data-item">
									<div className="stats-v2__data-label">{ translate( 'Top post' ) }</div>
									<div className="stats-v2__data-value">{ topPost.title }</div>
								</div>
							) }
							{ showTopPage && (
								<div className="stats-v2__data-item">
									<div className="stats-v2__data-label">{ translate( 'Top page' ) }</div>
									<div className="stats-v2__data-value">{ topPage.title }</div>
								</div>
							) }
							{ showViews && (
								<div className="stats-v2__data-item">
									<div className="stats-v2__data-label">{ translate( 'Total views' ) }</div>
									<div className="stats-v2__data-value">{ numberFormat( views ) }</div>
								</div>
							) }
							{ showVisitors && (
								<div className="stats-v2__data-item">
									<div className="stats-v2__data-label">{ translate( 'Total visitors' ) }</div>
									<div className="stats-v2__data-value">{ numberFormat( visitors ) }</div>
								</div>
							) }
						</div>
						<a href={ `/stats/day/${ siteSlug }` } className="stats-v2__all">
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
		siteId,
		siteSlug,
		topPostsQuery,
		visitsQuery,
		...statsData,
	};
};

export default connect( mapStateToProps )( StatsV2 );
