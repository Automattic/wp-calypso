import { CountComparisonCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import useSubscribersTotalsQueries from '../hooks/use-subscribers-totals-query';
import './style.scss';

function useSubscriberHighlights( siteId: number | null ) {
	const translate = useTranslate();

	const { data: subscribersTotals, isLoading, isError } = useSubscribersTotalsQueries( siteId );
	const highlights = [
		{
			heading: translate( 'Total email subscribers' ),
			count: subscribersTotals?.total_email,
		},
		{
			heading: translate( 'Free email subscribers' ),
			count: subscribersTotals?.total_email_free,
		},
		{
			heading: translate( 'Paid email subscribers' ),
			count: subscribersTotals?.total_email_paid,
		},
		{
			heading: translate( 'WordPress.com subscribers' ),
			count: subscribersTotals?.total_wpcom,
		},
	] as { heading: string; count: number | null }[];

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
			{ highlights.map( ( highlight ) => (
				<CountComparisonCard
					key={ highlight.heading }
					heading={ highlight.heading }
					count={ highlight.count }
					showValueTooltip
				/>
			) ) }
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
