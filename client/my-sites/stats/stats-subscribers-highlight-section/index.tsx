import { CountComparisonCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import useSubscribersTotalsQueries from '../hooks/use-subscribers-totals-query';
import './style.scss';

function useSubscriberHighlights( siteId: number | null ) {
	const translate = useTranslate();

	const { data: subscribersTotals, isLoading, isError } = useSubscribersTotalsQueries( siteId );
	// TODO: follow up on this once we have a way to determine if a site has paid newsletter set up.
	// issue: https://github.com/Automattic/wp-calypso/issues/80609
	const hasPaidNewsletter = true;

	const highlights = [
		{
			heading: translate( 'Total subscribers' ),
			count: subscribersTotals?.total,
			show: true, // Always show total subscribers.
			note: 'WordPress.com and Email subscribers excluding subscribers from social media',
		},
		{
			heading: translate( 'Paid subscribers' ),
			count: subscribersTotals?.paid_subscribers,
			show: hasPaidNewsletter,
			note: 'Paid WordPress.com subscribers',
		},
		{
			heading: translate( 'Free subscribers' ),
			count: subscribersTotals?.free_subscribers,
			show: hasPaidNewsletter,
			note: 'Email subscribers and free WordPress.com subscribers',
		},
		{
			heading: translate( 'WordPress.com subscribers' ),
			count: subscribersTotals?.total_wpcom,
			show: ! hasPaidNewsletter,
		},
		{
			heading: translate( 'Email subscribers' ),
			count: subscribersTotals?.total_email,
			show: ! hasPaidNewsletter,
		},
	] as { heading: string; count: number | null; show: boolean; note?: string }[];

	if ( isLoading || isError ) {
		// Nulling the count values makes the count comparison card render a '-' instead of a '0'.
		highlights.map( ( h ) => {
			if ( ! h.count && h.count !== 0 ) {
				h.count = null;
			}
		} );
	}
	return highlights;
}

function SubscriberHighlightsHeader() {
	const translate = useTranslate();
	const localizedTitle = translate( 'All time stats', {
		comment: 'Heading for Subscribers page highlights section',
	} );

	// TODO: Add an explanation here if we're running an older version of Odyssey Stats
	//       without support for subscriber highlights API endpoint support.

	return <h1 className="highlight-cards-heading">{ localizedTitle }</h1>;
}

function SubscriberHighlightsListing( { siteId }: { siteId: number | null } ) {
	const highlights = useSubscriberHighlights( siteId );

	return (
		<div className="highlight-cards-list">
			{ highlights.map(
				( highlight ) =>
					highlight.show && (
						<CountComparisonCard
							key={ highlight.heading }
							heading={ highlight.heading }
							count={ highlight.count }
							showValueTooltip
							note={ highlight.note }
						/>
					)
			) }
		</div>
	);
}

export default function SubscribersHighlightSection( { siteId }: { siteId: number | null } ) {
	return (
		<div className="highlight-cards subscribers-page has-odyssey-stats-bg-color">
			<SubscriberHighlightsHeader />
			<SubscriberHighlightsListing siteId={ siteId } />
		</div>
	);
}
