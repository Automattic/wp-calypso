import { CountComparisonCard, Popover } from '@automattic/components';
import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import useSubscribersTotalsQueries from '../hooks/use-subscribers-totals-query';
import './subscribers-highlight-section.scss';

interface SubscribersTotalsData {
	total_email: number;
	total_wpcom: number;
	total_email_free: number;
	total_email_paid: number;
}

function useSubscriberHighlights( subscribersTotals: SubscribersTotalsData ) {
	const translate = useTranslate();
	const highlights = [
		{
			heading: translate( 'Total email subscribers' ),
			count: subscribersTotals?.total_email || 0,
			// previousCount: 0, // TODO: get previous data
		},
		{
			heading: translate( 'Free email subscribers' ),
			count: subscribersTotals?.total_email_free || 0,
			// previousCount: 0, // TODO: get previous data
		},
		{
			heading: translate( 'Paid email subscribers' ),
			count: subscribersTotals?.total_email_paid || 0,
			// previousCount: 0, // TODO: get previous data
		},
		{
			heading: translate( 'WordPress.com subscribers' ),
			count: subscribersTotals?.total_wpcom || 0,
			// previousCount: 0, // TODO: get previous data
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

function SubscriberHighlightsListing( {
	subscribersTotals,
}: {
	subscribersTotals: SubscribersTotalsData;
} ) {
	const highlights = useSubscriberHighlights( subscribersTotals );

	return (
		<div className="highlight-cards-list">
			{ highlights.map( ( highlight ) => (
				<CountComparisonCard
					key={ highlight.heading }
					heading={ highlight.heading }
					count={ highlight.count }
					//previousCount={ highlight.previousCount }
					showValueTooltip
				/>
			) ) }
		</div>
	);
}

export default function SubscribersHighlightSection( { siteId }: { siteId: number | null } ) {
	const { data } = useSubscribersTotalsQueries( siteId ); // TODO: isLoading, isError can be used to handle loading and an error state

	return (
		<div className="highlight-cards subscribers-page has-odyssey-stats-bg-color">
			<SubscriberHighlightsHeader />
			<SubscriberHighlightsListing subscribersTotals={ data } />
		</div>
	);
}
