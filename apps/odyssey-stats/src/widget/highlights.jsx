import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import useTopPostsQuery from '../hooks/use-top-posts-query';

import './hightlights.scss';

function TopColumn( { items, viewAllUrl, viewAllText, title, className = null } ) {
	const translate = useTranslate();
	// TODO: add a placeholder state

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

	const { data: topPostsAndPages = [] } = useTopPostsQuery( siteId, 'day', 7, queryDate );

	return (
		<div className="stats-widget-highlights">
			<div className="stats-widget-highlights__header">
				<label>{ translate( '7 Day Highlights' ) }</label>
				<a href={ odysseyStatsBaseUrl }>{ translate( 'View detailed stats' ) }</a>
			</div>
			<div className="stats-widget-highlights__body">
				<TopColumn
					className="stats-widget-highlights__column"
					title={ translate( 'Top Posts & Pages' ) }
					viewAllUrl={ odysseyStatsBaseUrl }
					viewAllText={ translate( 'View all posts & pages stats' ) }
					items={ topPostsAndPages }
				/>
				<TopColumn
					className="stats-widget-highlights__column"
					title={ translate( 'Top Referrers' ) }
					viewAllUrl={ odysseyStatsBaseUrl }
					viewAllText={ translate( 'View all referrer stats' ) }
					items={ [
						{ name: 'Have anything fun or interesting you’d like to share?', value: 59 },
						{ name: 'What memorable meal have you had recently?', value: 345 },
						{ name: 'What needs improvement?', value: 34 },
						{ name: 'What’s happening in your life?  ', value: 346 },
						{ name: 'How did you do on last week’s priorities?  ', value: 5673 },
					] }
				/>
			</div>
		</div>
	);
}
