import { Card } from '@automattic/components';
import { Icon, people, postContent, starEmpty, commentContent } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
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

const STATS_QUERY = {};

const FORMATTER = new Intl.NumberFormat( 'en-GB' );
const COMPACT_FORMATTER = new Intl.NumberFormat( 'en-GB', {
	notation: 'compact',
	compactDisplay: 'short',
	maximumFractionDigits: 1,
} );

function formatNumber( number: number | null, isCompact = false ) {
	const formatter = isCompact ? COMPACT_FORMATTER : FORMATTER;

	return Number.isFinite( number ) ? formatter.format( number as number ) : '-';
}

export default function AllTimeHighlightsSection( { siteId }: { siteId: number } ) {
	const translate = useTranslate();

	const isRequesting = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, 'stats', STATS_QUERY )
	);

	const { comments, posts, views, visitors, viewsBestDay, viewsBestDayTotal } = useSelector(
		( state ) => getSiteStatsNormalizedData( state, siteId, 'stats', STATS_QUERY ) || {}
	) as AllTimeData;


	const isLoading = isRequesting && ! views;

	let bestViewsEverMonthDay;
	let bestViewsEverYear;

	if ( viewsBestDay && ! isLoading ) {
		bestViewsEverMonthDay = moment( viewsBestDay ).format( 'MMMM D' );
		bestViewsEverYear = moment( viewsBestDay ).format( 'YYYY' );
	}

	const infoItems = [
		{
			id: 'views',
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
		{ id: 'likes', icon: starEmpty, title: translate( 'Likes' ), count: 13092212 },
		{ id: 'comments', icon: commentContent, title: translate( 'Comments' ), count: comments },
	];

	const mostPopularTimeItems = {
		id: 'mostPopularTime',
		heading: translate( 'Most popular time' ),
		items: [
			{
				id: 'bestDay',
				header: translate( 'Best day' ),
				content: 'Thursday',
				footer: translate( '%p% of views', { args: [ 25 ] } ),
			},
			{
				id: 'bestHour',
				header: translate( 'Best hour' ),
				content: '2 PM',
				footer: translate( '%p% of views', { args: [ 18 ] } ),
			},
		],
	};

	const bestViewsEverItems = {
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
				content: formatNumber( viewsBestDayTotal, true ),
				footer: translate( '%p% of views', { args: [ 25 ] } ),
			},
		],
	};

	return (
		<div className="stats__all-time-highlights-section">
			{ siteId && <QuerySiteStats siteId={ siteId } statType="stats" query={ STATS_QUERY } /> }

			<div className="highlight-cards">
				<h1 className="highlight-cards-heading">{ translate( 'All-time highlights' ) }</h1>

				<div className="highlight-cards-list">
					<Card className="highlight-card">
						<div className="highlight-card-heading">{ translate( 'All-time stats' ) }</div>
						<div className="highlight-card-info-item-list">
							{ infoItems.map( ( info ) => {
								return (
									<div key={ info.id } className="highlight-card-info-item">
										<Icon icon={ info.icon } />

										<span className="highlight-card-info-item-title">{ info.title }</span>

										<span
											className="highlight-card-info-item-count"
											title={ Number.isFinite( info.count ) ? String( info.count ) : undefined }
										>
											{ formatNumber( info.count ) }
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
