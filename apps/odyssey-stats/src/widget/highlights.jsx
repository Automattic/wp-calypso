import { formattedNumber } from '@automattic/components';
import { Icon, external } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import useReferrersQuery from '../hooks/use-referrers-query';
import useTopPostsQuery from '../hooks/use-top-posts-query';

import './hightlights.scss';

const HIGHLIGHT_ITEMS_LIMIT = 5;
const postAndPageLink = ( baseUrl, siteId, postId ) => {
	return `${ baseUrl }#!/stats/post/${ postId }/${ siteId }`;
};

function ItemWrapper( { odysseyStatsBaseUrl, siteId, isItemLink, item } ) {
	const translate = useTranslate();

	const renderedItem = (
		<div>
			<p>{ item.title }</p>
			<span>
				{ translate( '%(views)s Views', {
					args: { views: formattedNumber( item.views ) },
				} ) }
			</span>
		</div>
	);

	return isItemLink ? (
		<a
			href={ postAndPageLink( odysseyStatsBaseUrl, siteId, item.id ) }
			rel="noopener noreferrer"
			title={ translate( 'View highlight post or page', {
				textOnly: true,
				context: 'View highlight post or page',
			} ) }
			aria-label={ translate( 'View highlight post or page', {
				textOnly: true,
				context: 'View highlight post or page',
			} ) }
		>
			{ renderedItem }
			<Icon className="stats-icon" icon={ external } size={ 18 } />
		</a>
	) : (
		renderedItem
	);
}

function TopColumn( {
	items,
	viewAllUrl,
	viewAllText,
	title,
	odysseyStatsBaseUrl,
	siteId,
	isItemLink = false,
	className = null,
} ) {
	const translate = useTranslate();

	return (
		<div className={ classNames( 'stats-widget-highlights-card', className ) }>
			<label className="stats-widget-highlights-card__title">{ title }</label>
			{ items.length === 0 && (
				<div className="stats-widget-highlights-card__empty">
					<span>{ translate( 'Sorry, nothing to report.' ) }</span>
				</div>
			) }
			{ items.length > 0 && (
				<ul className="stats-widget-highlights-card__list">
					{ items.slice( 0, HIGHLIGHT_ITEMS_LIMIT ).map( ( item, idx ) => (
						<li key={ idx }>
							<ItemWrapper
								item={ item }
								odysseyStatsBaseUrl={ odysseyStatsBaseUrl }
								siteId={ siteId }
								isItemLink={ isItemLink }
							/>
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

	// TODO: add a loading state placeholder with isFetching returned from the query.
	const { data: topPostsAndPages = [] } = useTopPostsQuery( siteId, 'day', 7, queryDate );
	const { data: topReferrers = [] } = useReferrersQuery( siteId, 'day', 7, queryDate );

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
					odysseyStatsBaseUrl={ odysseyStatsBaseUrl }
					siteId={ siteId }
					isItemLink={ true }
				/>
				<TopColumn
					className="stats-widget-highlights__column"
					title={ translate( 'Top Referrers' ) }
					viewAllUrl={ viewAllReferrerStatsUrl }
					viewAllText={ translate( 'View all referrer stats' ) }
					items={ topReferrers }
					odysseyStatsBaseUrl={ odysseyStatsBaseUrl }
					siteId={ siteId }
				/>
			</div>
		</div>
	);
}
