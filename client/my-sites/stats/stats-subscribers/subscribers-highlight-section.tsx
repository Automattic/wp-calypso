import { CountComparisonCard, Popover } from '@automattic/components';
import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import './subscribers-highlight-section.scss';

function useSubscriberHighlights() {
	const translate = useTranslate();
	const highlights = [
		{
			heading: translate( 'Total email subscribers' ),
			count: 1410,
			previousCount: 1080,
		},
		{
			heading: translate( 'Free email subscribers' ),
			count: 1340,
			previousCount: 1034,
		},
		{
			heading: translate( 'Paid email subscribers' ),
			count: 70,
			previousCount: 46,
		},
		{
			heading: translate( 'WordPress.com subscribers' ),
			count: 322,
			previousCount: 326,
		},
	];
	return highlights;
}

function SubscriberHighlightsHeader() {
	const translate = useTranslate();
	const [ isTooltipVisible, setTooltipVisible ] = useState( false );
	const infoReferenceElement = useRef( null );
	const localizedTitle = translate( 'All time stats', {
		comment: 'Heading for Subscribers page highlights section',
	} );
	return (
		<h1 className="highlight-cards-heading">
			{ localizedTitle }{ ' ' }
			<span
				className="info-wrapper"
				ref={ infoReferenceElement }
				onMouseEnter={ () => setTooltipVisible( true ) }
				onMouseLeave={ () => setTooltipVisible( false ) }
			>
				<Icon className="info-icon" icon={ info } />
			</span>
			<Popover
				className="tooltip tooltip--darker tooltip-subscribers-page highlight-card-tooltip"
				isVisible={ isTooltipVisible }
				position="bottom right"
				context={ infoReferenceElement.current }
			>
				<div className="highlight-card-tooltip-content">
					<p>Tooltip content goes here.</p>
				</div>
			</Popover>
		</h1>
	);
}

function SubscriberHighlightsListing() {
	const highlights = useSubscriberHighlights();

	return (
		<div className="highlight-cards-list">
			{ highlights.map( ( highlight ) => (
				<CountComparisonCard
					key={ highlight.heading }
					heading={ highlight.heading }
					count={ highlight.count }
					previousCount={ highlight.previousCount }
					showValueTooltip
				/>
			) ) }
		</div>
	);
}

export default function SubscribersHighlightSection() {
	return (
		<div className="highlight-cards subscribers-page has-odyssey-stats-bg-color">
			<SubscriberHighlightsHeader />
			<SubscriberHighlightsListing />
		</div>
	);
}
