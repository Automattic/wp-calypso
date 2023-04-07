import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

import './hightlights.scss';

function TopColumn( { items, viewAllUrl, viewAllText, title, className = null } ) {
	const translate = useTranslate();
	return (
		<div className={ classNames( 'stats-widget-highlights-card', className ) }>
			<label className="stats-widget-highlights-card__title">{ title }</label>
			<ul className="stats-widget-highlights-card__list">
				{ items.map( ( item, idx ) => (
					<li key={ idx }>
						<p>{ item.name }</p>
						<span>{ translate( '%(views)s Views', { args: { views: item.value } } ) }</span>
					</li>
				) ) }
			</ul>
			<div className="stats-widget-highlights-card__view-all">
				<a href={ viewAllUrl }>{ viewAllText }</a>
			</div>
		</div>
	);
}

export default function Highlights( { odysseyStatsBaseUrl } ) {
	const translate = useTranslate();

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
					items={ [
						{ name: 'What memorable meal have you had recently?', value: 12334235 },
						{ name: 'What’s happening in your life?', value: 444 },
						{ name: 'What went well? ', value: 23 },
						{ name: 'What needs improvement?', value: 436 },
						{ name: 'What are you looking forward to?', value: 345 },
					] }
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
