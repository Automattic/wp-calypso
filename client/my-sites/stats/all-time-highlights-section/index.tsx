import {
	Card,
	ComponentSwapper,
	PercentCalculator as percentCalculator,
	ShortenedNumber,
	formattedNumber,
} from '@automattic/components';
import { eye } from '@automattic/components/src/icons';
import { Icon, people, postContent, starEmpty, commentContent } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import QueryPosts from 'calypso/components/data/query-posts';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import DotPager from 'calypso/components/dot-pager';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import PostCardsGroup from './post-cards-group';

import './style.scss';

type AllTimeData = {
	comments: number;
	posts: number;
	views: number;
	visitors: number;
	viewsBestDay: string;
	viewsBestDayTotal: number;
};

type MostPopularData = {
	day: string;
	percent: number;
	hour: string;
	hourPercent: number;
};

export default function AllTimeHighlightsSection( {
	siteId,
	siteSlug,
}: {
	siteId: number;
	siteSlug: string;
} ) {
	const translate = useTranslate();

	const insightsQuery = {};

	const isStatsRequesting = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, 'stats', {} )
	);

	const isInsightsRequesting = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, 'statsInsights', insightsQuery )
	);

	const { comments, posts, views, visitors, viewsBestDay, viewsBestDayTotal } = useSelector(
		( state ) => getSiteStatsNormalizedData( state, siteId, 'stats', {} ) || {}
	) as AllTimeData;

	const { day, percent, hour, hourPercent } = useSelector(
		( state ) => getSiteStatsNormalizedData( state, siteId, 'statsInsights', insightsQuery ) || {}
	) as MostPopularData;

	const userLocale = useSelector( getCurrentUserLocale );

	const isStatsLoading = isStatsRequesting && ! views;
	const isInsightsLoading = isInsightsRequesting && ! percent;

	const infoItems = useMemo( () => {
		return [
			{ id: 'views', icon: eye, title: translate( 'Views' ), count: views },
			{ id: 'visitors', icon: people, title: translate( 'Visitors' ), count: visitors },
			{ id: 'posts', icon: postContent, title: translate( 'Posts' ), count: posts },
			{ id: 'likes', icon: starEmpty, title: translate( 'Likes' ), count: 13092212, hidden: true },
			{ id: 'comments', icon: commentContent, title: translate( 'Comments' ), count: comments },
		];
	}, [ comments, posts, translate, views, visitors ] );

	const mostPopularTimeItems = useMemo( () => {
		return {
			id: 'mostPopularTime',
			loading: isInsightsLoading,
			heading: translate( 'Most popular time' ),
			items: [
				{
					id: 'bestDay',
					header: translate( 'Best day' ),
					content: day,
					footer: translate( '%(percent)d%% of views', {
						args: { percent: percent || 0 },
						context: 'Stats: Percentage of views',
					} ),
				},
				{
					id: 'bestHour',
					header: translate( 'Best hour' ),
					content: hour,
					footer: translate( '%(percent)d%% of views', {
						args: { percent: hourPercent || 0 },
						context: 'Stats: Percentage of views',
					} ),
				},
			],
		};
	}, [ day, hour, hourPercent, isInsightsLoading, percent, translate ] );

	const bestViewsEverItems = useMemo( () => {
		let bestViewsEverMonthDay = '';
		let bestViewsEverYear = '';

		if ( viewsBestDay && ! isStatsLoading ) {
			const theDay = new Date( viewsBestDay );

			bestViewsEverMonthDay = theDay.toLocaleDateString( userLocale, {
				month: 'long',
				day: 'numeric',
			} );
			bestViewsEverYear = theDay.toLocaleDateString( userLocale, {
				year: 'numeric',
			} );
		}

		const bestViewsEverPercent = Number.isFinite( viewsBestDayTotal )
			? percentCalculator( viewsBestDayTotal, views )
			: 0;

		return {
			id: 'bestViewsEver',
			heading: translate( 'Best views ever' ),
			items: [
				{
					id: 'day',
					header: translate( 'Day' ),
					content: bestViewsEverMonthDay,
					footer: bestViewsEverYear,
				},
				{
					id: 'views',
					header: translate( 'Views' ),
					content: <ShortenedNumber value={ viewsBestDayTotal } />,
					footer: translate( '%(percent)d%% of views', {
						args: { percent: bestViewsEverPercent || 0 },
						context: 'Stats: Percentage of views',
					} ),
				},
			],
		};
	}, [ isStatsLoading, translate, views, viewsBestDay, viewsBestDayTotal ] );

	const mobileCards = (
		<div className="highlight-cards-mobile">
			<h1 className="highlight-cards-heading">{ translate( 'Highlights' ) }</h1>
			<DotPager>
				<Card className="highlight-card">
					<div className="highlight-card-heading">{ translate( 'All-time stats' ) }</div>
					<div className="highlight-card-info-item-list">
						{ infoItems
							.filter( ( i ) => ! i.hidden )
							.map( ( info ) => {
								return (
									<div key={ info.id } className="highlight-card-info-item">
										<Icon icon={ info.icon } />

										<span className="highlight-card-info-item-title">{ info.title }</span>

										<span
											className="highlight-card-info-item-count"
											title={ Number.isFinite( info.count ) ? String( info.count ) : undefined }
										>
											{ formattedNumber( info.count ) }
										</span>
									</div>
								);
							} ) }
					</div>
				</Card>

				{ [ mostPopularTimeItems, bestViewsEverItems ].map( ( card ) => {
					return (
						<Card key={ card.id } className="highlight-card">
							<div className="highlight-card-heading">{ card.heading }</div>
							<div className="highlight-card-detail-item-list">
								{ card.items.map( ( item ) => {
									return (
										<div key={ item.id } className="highlight-card-detail-item">
											<div className="highlight-card-detail-item-header">{ item.header }</div>

											<div className="highlight-card-detail-item-content">{ item.content }</div>

											<div className="highlight-card-detail-item-footer">{ item.footer }</div>
										</div>
									);
								} ) }
							</div>
						</Card>
					);
				} ) }
			</DotPager>

			<PostCardsGroup siteId={ siteId } siteSlug={ siteSlug } />
		</div>
	);

	const highlightCards = (
		<div className="highlight-cards">
			<h1 className="highlight-cards-heading">{ translate( 'All-time highlights' ) }</h1>

			<div className="highlight-cards-list">
				<Card className="highlight-card">
					<div className="highlight-card-heading">{ translate( 'All-time stats' ) }</div>
					<div className="highlight-card-info-item-list">
						{ infoItems
							.filter( ( i ) => ! i.hidden )
							.map( ( info ) => {
								return (
									<div key={ info.id } className="highlight-card-info-item">
										<Icon icon={ info.icon } />

										<span className="highlight-card-info-item-title">{ info.title }</span>

										<span
											className="highlight-card-info-item-count"
											title={ Number.isFinite( info.count ) ? String( info.count ) : undefined }
										>
											{ formattedNumber( info.count ) }
										</span>
									</div>
								);
							} ) }
					</div>
				</Card>

				{ [ mostPopularTimeItems, bestViewsEverItems ].map( ( card ) => {
					return (
						<Card key={ card.id } className="highlight-card">
							<div className="highlight-card-heading">{ card.heading }</div>
							<div className="highlight-card-detail-item-list">
								{ card.items.map( ( item ) => {
									return (
										<div key={ item.id } className="highlight-card-detail-item">
											<div className="highlight-card-detail-item-header">{ item.header }</div>

											<div className="highlight-card-detail-item-content">{ item.content }</div>

											<div className="highlight-card-detail-item-footer">{ item.footer }</div>
										</div>
									);
								} ) }
							</div>
						</Card>
					);
				} ) }
			</div>

			<PostCardsGroup siteId={ siteId } siteSlug={ siteSlug } />
		</div>
	);

	return (
		<div className="stats__all-time-highlights-section">
			{ siteId && (
				<>
					<QueryPosts
						siteId={ siteId }
						postId={ null }
						query={ { status: 'publish', number: 1 } }
					/>
					<QuerySiteStats siteId={ siteId } statType="stats" query={ {} } />
					<QuerySiteStats siteId={ siteId } statType="statsInsights" query={ insightsQuery } />
				</>
			) }

			<ComponentSwapper
				className="all-time-highlights-section__highlight-cards-swapper"
				breakpoint="<660px"
				breakpointActiveComponent={ mobileCards }
				breakpointInactiveComponent={ highlightCards }
			/>
		</div>
	);
}
