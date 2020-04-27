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
import { getCountRecords } from 'state/stats/chart-tabs/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import {
	getMostPopularDatetime,
	getTopPostAndPage,
	getViewAndVisitors,
	isLoadingStats,
} from './utils';

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
	visitsQuery,
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

	const showTopPost = !! topPost;
	const showTopPage = !! topPage;
	const showViews = ! showTopPost || ! showTopPage;
	const showVisitors = ! showTopPost && ! showTopPage;

	return (
		<>
			{ heading }
			<Card className="stats-v2">
				<QuerySiteStats siteId={ siteId } statType="statsVisits" query={ visitsQuery } />
				<QuerySiteStats siteId={ siteId } statType="statsInsights" query={ insightsQuery } />
				<QuerySiteStats siteId={ siteId } statType="statsTopPosts" query={ topPostsQuery } />
				{ isLoading ? (
					<Chart data={ placeholderChartData } isPlaceholder>
						<Spinner />
					</Chart>
				) : (
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
		</>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const isSiteUnlaunched = isUnlaunchedSite( state, siteId );
	const gmtOffset = getSiteOption( state, siteId, 'gmt_offset' );
	const date = moment()
		.utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 )
		.format( 'YYYY-MM-DD' );
	const period = 'day';
	const quantity = 7;

	const chartTab = 'views';
	const chartQuery = {
		chartTab,
		date,
		period,
		quantity,
		siteId,
		statFields: [ chartTab ],
	};
	let chartData;

	let topPost;
	let topPage;
	const topPostsQuery = {
		date,
		num: quantity,
		period,
	};

	let views;
	let visitors;
	const visitsQuery = {
		unit: period,
		quantity: quantity,
		stat_fields: 'views,visitors',
	};

	let mostPopularDay;
	let mostPopularTime;
	const insightsQuery = {};

	const isLoading = isLoadingStats(
		state,
		siteId,
		chartTab,
		period,
		insightsQuery,
		topPostsQuery,
		visitsQuery
	);

	if ( ! isSiteUnlaunched && ! isLoading ) {
		const counts = getCountRecords( state, siteId, period );
		chartData = buildChartData( [], chartTab, counts, period, date );

		const mostPopularDateTime = getMostPopularDatetime( state, siteId, insightsQuery );
		mostPopularDay = mostPopularDateTime.day ?? '-';
		mostPopularTime = mostPopularDateTime?.time ?? '-';

		const topPostAndPage = getTopPostAndPage( state, siteId, topPostsQuery );
		topPost = topPostAndPage.post;
		topPage = topPostAndPage.page;

		const viewsAndVisitors = getViewAndVisitors( state, siteId, visitsQuery );
		views = viewsAndVisitors.views;
		visitors = viewsAndVisitors.visitors;
	}

	return {
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
		visitsQuery,
	};
};

export default connect( mapStateToProps )( StatsV2 );
