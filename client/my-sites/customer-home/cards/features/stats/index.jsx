import { Card, Spinner } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import { createSelector } from '@automattic/state-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import IllustrationStatsIntro from 'calypso/assets/images/stats/illustration-stats-intro.svg';
import CardHeading from 'calypso/components/card-heading';
import Chart from 'calypso/components/chart';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { preventWidows } from 'calypso/lib/formatting';
import { buildChartData } from 'calypso/my-sites/stats/stats-chart-tabs/utility';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import {
	getSiteAdminUrl,
	getSiteOption,
	isAdminInterfaceWPAdmin,
} from 'calypso/state/sites/selectors';
import { requestChartCounts } from 'calypso/state/stats/chart-tabs/actions';
import { getCountRecords, getLoadingTabs } from 'calypso/state/stats/chart-tabs/selectors';
import {
	getMostPopularDatetime,
	getTopPostAndPage,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

const placeholderChartData = Array.from( { length: 7 }, () => ( {
	value: Math.random(),
} ) );

export const StatsV2 = ( {
	chartData,
	chartQuery,
	insightsQuery,
	isLoading,
	isSiteUnlaunched,
	adminInterfaceIsWPAdmin,
	mostPopularDay,
	mostPopularTime,
	siteCreatedAt,
	siteId,
	siteSlug,
	siteAdminUrl,
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
		: preventWidows(
				translate(
					'No stats to display yet. Publish or share a post to get some traffic to your site.'
				),
				4
		  );
	const renderChart = ! isSiteUnlaunched && ! isLoading && views > 0;

	return (
		<div className="stats">
			{ ! isSiteUnlaunched && (
				<>
					<QuerySiteStats siteId={ siteId } statType="statsInsights" query={ insightsQuery } />
					<QuerySiteStats siteId={ siteId } statType="statsTopPosts" query={ topPostsQuery } />
				</>
			) }
			{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
			<Card className={ clsx( 'customer-home__card', { 'stats__with-chart': renderChart } ) }>
				{ isSiteUnlaunched && (
					<Chart data={ placeholderChartData } isPlaceholder>
						<div>
							{ translate( 'Launch your site to see a snapshot of traffic and insights.' ) }
							<InlineSupportLink
								supportContext="stats"
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
							<img src={ IllustrationStatsIntro } alt="" />
						</div>
						<div className="stats__empty-text">
							{ translate(
								'Stats can help you optimize for the right keywords, and feature content your readers are interested in.'
							) }
							<InlineSupportLink
								supportContext="stats"
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
				{ renderChart && (
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
									<div className="stats__data-value">{ formatNumber( views ) }</div>
								</div>
							) }
							{ showVisitors && (
								<div className="stats__data-item">
									<div className="stats__data-label">{ translate( 'Total visitors' ) }</div>
									<div className="stats__data-value">{ formatNumber( visitors ) }</div>
								</div>
							) }
						</div>
						<div className="stats__all">
							<a
								href={
									adminInterfaceIsWPAdmin
										? `${ siteAdminUrl }admin.php?page=stats`
										: `/stats/day/${ siteSlug }`
								}
								className="stats__all-link"
							>
								{ translate( 'See all stats' ) }
							</a>
						</div>
					</>
				) }
			</Card>
		</div>
	);
};

const getStatsQueries = createSelector(
	( state, siteId ) => {
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
	},
	( state, siteId ) => getSiteOption( state, siteId, 'gmt_offset' )
);

const getStatsData = createSelector(
	( state, siteId, chartQuery, insightsQuery, topPostsQuery ) => {
		const counts = getCountRecords(
			state,
			siteId,
			chartQuery.date,
			chartQuery.period,
			chartQuery.quantity
		);
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
	},
	( state, siteId, chartQuery, insightsQuery, topPostsQuery ) => [
		getCountRecords( state, siteId, chartQuery.date, chartQuery.period, chartQuery.quantity ),
		insightsQuery,
		topPostsQuery,
	]
);

const isLoadingStats = ( state, siteId, chartQuery, insightsQuery, topPostsQuery ) =>
	getLoadingTabs( state, siteId, chartQuery.date, chartQuery.period, chartQuery.quantity ).includes(
		chartQuery.chartTab
	) ||
	isRequestingSiteStatsForQuery( state, siteId, 'statsInsights', insightsQuery ) ||
	isRequestingSiteStatsForQuery( state, siteId, 'statsTopPosts', topPostsQuery );

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const siteAdminUrl = getSiteAdminUrl( state, siteId );
	const isSiteUnlaunched = isUnlaunchedSite( state, siteId );
	const adminInterfaceIsWPAdmin = isAdminInterfaceWPAdmin( state, siteId );
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
		adminInterfaceIsWPAdmin,
		siteCreatedAt,
		siteId,
		siteSlug,
		siteAdminUrl,
		topPostsQuery,
		visitsQuery,
		...statsData,
	};
};

export default connect( mapStateToProps )( StatsV2 );
