import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import useReferrersQuery from '../hooks/use-referrers-query';
import useTopPostsQuery from '../hooks/use-top-posts-query';

import './hightlights.scss';

function TopColumn( { items, viewAllUrl, viewAllText, title, isLoading, className = null } ) {
	const translate = useTranslate();

	return (
		<div className={ classNames( 'stats-widget-highlights-card', className ) }>
			<label className="stats-widget-highlights-card__title">{ title }</label>
			{ items.length === 0 && (
				<p className="stats-widget-highlights-card__empty">
					{ isLoading
						? `${ translate( 'Loading' ) }...`
						: translate( 'Sorry, nothing to report.' ) }
				</p>
			) }
			{ items.length > 0 && (
				<ul className="stats-widget-highlights-card__list">
					{ items.map( ( item, idx ) => (
						<li key={ idx }>
							<p>{ item.title }</p>
							<span>{ translate( '%(views)s Views', { args: { views: item.views } } ) }</span>
						</li>
					) ) }
				</ul>
			) }
			<div className="stats-widget-highlights-card__view-all">
				<a href={ viewAllUrl }>{ viewAllText }</a>
			</div>
		</div>
	);
}

export default function Highlights( { siteId, gmtOffset, odysseyStatsBaseUrl } ) {
	const translate = useTranslate();
	const queryDate = moment()
		.utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 )
		.format( 'YYYY-MM-DD' );
	const viewAllPostsStatsUrl = `${ odysseyStatsBaseUrl }#!/stats/day/posts/${ siteId }?startDate=${ queryDate }&summarize=1&num=7`;
	const viewAllReferrerStatsUrl = `${ odysseyStatsBaseUrl }#!/stats/day/referrers/${ siteId }?startDate=${ queryDate }&summarize=1&num=7`;

	const { data: topPostsAndPages = [], isFetching: isFetchingPostsAndPages } = useTopPostsQuery(
		siteId,
		'day',
		7,
		queryDate
	);
	const { data: topReferrers = [], isFetching: isFetchingReferrers } = useReferrersQuery(
		siteId,
		'day',
		7,
		queryDate
	);

	return (
		<div className="stats-widget-highlights stats-widget-card">
			<div className="stats-widget-highlights__header">
				<label>{ translate( '7 Day Highlights' ) }</label>
				<a href={ odysseyStatsBaseUrl }>{ translate( 'View detailed stats' ) }</a>
			</div>
			<div className="stats-widget-highlights__body">
				<TopColumn
					className="stats-widget-highlights__column"
					title={ translate( 'Top Posts & Pages' ) }
					viewAllUrl={ viewAllPostsStatsUrl }
					viewAllText={ translate( 'View all posts & pages stats' ) }
					items={ topPostsAndPages }
					isLoading={ isFetchingPostsAndPages }
				/>
				<TopColumn
					className="stats-widget-highlights__column"
					title={ translate( 'Top Referrers' ) }
					viewAllUrl={ viewAllReferrerStatsUrl }
					viewAllText={ translate( 'View all referrer stats' ) }
					items={ topReferrers }
					isLoading={ isFetchingReferrers }
				/>
			</div>
		</div>
	);
}
