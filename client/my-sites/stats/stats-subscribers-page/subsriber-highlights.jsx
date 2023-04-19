import { HighlightCard, Popover } from '@automattic/components';
import { Icon, info } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import '../wordads/highlights-section.scss';

function getSubscriberHighlights() {
	const highlights = [
		{
			id: 1,
			heading: 'Total email subscribers',
			count: 1410,
			previousCount: 1080,
		},
		{
			id: 2,
			heading: 'Free email subscribers',
			count: 1340,
			previousCount: 1034,
		},
		{
			id: 3,
			heading: 'Paid email subscribers',
			count: 70,
			previousCount: 46,
		},
		{
			id: 4,
			heading: 'WordPress.com subscribers',
			count: 322,
			previousCount: 326,
		},
	];
	return highlights;
}

function SubscriberHighlightsHeader() {
	const [ isTooltipVisible, setTooltipVisible ] = useState( false );
	const infoReferenceElement = useRef( null );
	const localizedTitle = translate( 'All time stats', {
		comment: 'Heading for Subscribers page highlights section',
	} );
	const showNotices = true;
	const tooltipContent = <p>Tooltip content goes here.</p>;
	return (
		<h1 className="highlight-cards-heading">
			{ localizedTitle }{ ' ' }
			{ showNotices && (
				<>
					<span
						className="info-wrapper"
						ref={ infoReferenceElement }
						onMouseEnter={ () => setTooltipVisible( true ) }
						onMouseLeave={ () => setTooltipVisible( false ) }
					>
						<Icon className="info-icon" icon={ info } />
					</span>
					<Popover
						className="tooltip tooltip--darker tooltip-wordads highlight-card-tooltip"
						isVisible={ isTooltipVisible }
						position="bottom right"
						context={ infoReferenceElement.current }
					>
						<div className="highlight-card-tooltip-content">{ tooltipContent }</div>
					</Popover>
				</>
			) }
		</h1>
	);
}

function SubscriberHighlightsListing() {
	const highlights = getSubscriberHighlights();

	return (
		<div className="highlight-cards-list">
			{ highlights.map( ( highlight ) => (
				<HighlightCard
					key={ highlight.id }
					heading={ highlight.heading }
					count={ highlight.count }
					previousCount={ highlight.previousCount }
					showValueTooltip
				/>
			) ) }
		</div>
	);
}

export default function SubscriberHighlights() {
	return (
		<div className="highlight-cards wordads has-odyssey-stats-bg-color">
			<SubscriberHighlightsHeader />
			<SubscriberHighlightsListing />
		</div>
	);
}
