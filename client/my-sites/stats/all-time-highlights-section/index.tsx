import {
	Card,
	PercentCalculator as percentCalculator,
	ShortenedNumber,
	formattedNumber,
} from '@automattic/components';
import { Icon, people, postContent, starEmpty, commentContent } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import DotPager from 'calypso/components/dot-pager';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';

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

export default function AllTimeHighlightsSection( { siteId }: { siteId: number } ) {
	const translate = useTranslate();

	const isStatsRequesting = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, 'stats', {} )
	);

	const isInsightsRequesting = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, 'statsInsights', {} )
	);

	const { comments, posts, views, visitors, viewsBestDay, viewsBestDayTotal } = useSelector(
		( state ) => getSiteStatsNormalizedData( state, siteId, 'stats', {} ) || {}
	) as AllTimeData;

	const { day, percent, hour, hourPercent } = useSelector(
		( state ) => getSiteStatsNormalizedData( state, siteId, 'statsInsights', {} ) || {}
	) as MostPopularData;

	const isStatsLoading = isStatsRequesting && ! views;
	const isInsightsLoading = isInsightsRequesting && ! percent;

	const infoItems = useMemo( () => {
		return [
			{
				id: 'views',
				//TODO: replace with an icon when available.
				icon: (
					<svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="m4 13 .67.336.003-.005a2.42 2.42 0 0 1 .094-.17c.071-.122.18-.302.329-.52.298-.435.749-1.017 1.359-1.598C7.673 9.883 9.498 8.75 12 8.75s4.326 1.132 5.545 2.293c.61.581 1.061 1.163 1.36 1.599a8.29 8.29 0 0 1 .422.689l.002.005L20 13l.67-.336v-.003l-.003-.005-.008-.015-.028-.052a9.752 9.752 0 0 0-.489-.794 11.6 11.6 0 0 0-1.562-1.838C17.174 8.617 14.998 7.25 12 7.25S6.827 8.618 5.42 9.957c-.702.669-1.22 1.337-1.563 1.839a9.77 9.77 0 0 0-.516.845l-.008.015-.002.005-.001.002v.001L4 13Zm8 3a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
							fill="#00101C"
						/>
					</svg>
				),
				title: translate( 'Views' ),
				count: views,
			},
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
			bestViewsEverMonthDay = theDay.toLocaleDateString( undefined, {
				month: 'long',
				day: 'numeric',
			} );
			bestViewsEverYear = theDay.toLocaleDateString( undefined, {
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

	return (
		<div className="stats__all-time-highlights-section">
			{ siteId && (
				<>
					<QuerySiteStats siteId={ siteId } statType="stats" query={ {} } />
					<QuerySiteStats siteId={ siteId } statType="statsInsights" />
				</>
			) }

			<div className="stats__all-time-highlights-mobile">
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
			</div>

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
			</div>
		</div>
	);
}
