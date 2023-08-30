import config from '@automattic/calypso-config';
import { CountComparisonCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import QueryMembershipProducts from 'calypso/components/data/query-memberships';
import { useSelector } from 'calypso/state';
import useSubscribersTotalsQueries from '../hooks/use-subscribers-totals-query';
import './style.scss';

function useSubscriberHighlights(
	siteId: number | null,
	hasAddedPaidSubscriptionProduct: boolean
) {
	const translate = useTranslate();

	const { data: subscribersTotals, isLoading, isError } = useSubscribersTotalsQueries( siteId );

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
			show: hasAddedPaidSubscriptionProduct,
			note: 'Paid WordPress.com subscribers',
		},
		{
			heading: translate( 'Free subscribers' ),
			count: subscribersTotals?.free_subscribers,
			show: hasAddedPaidSubscriptionProduct,
			note: 'Email subscribers and free WordPress.com subscribers',
		},
		{
			heading: translate( 'WordPress.com subscribers' ),
			count: subscribersTotals?.total_wpcom,
			show: ! hasAddedPaidSubscriptionProduct,
		},
		{
			heading: translate( 'Email subscribers' ),
			count: subscribersTotals?.total_email,
			show: ! hasAddedPaidSubscriptionProduct,
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
	const localizedTitle = translate( 'All-time stats', {
		comment: 'Heading for Subscribers page highlights section',
	} );

	// TODO: Add an explanation here if we're running an older version of Odyssey Stats
	//       without support for subscriber highlights API endpoint support.

	return <h1 className="highlight-cards-heading">{ localizedTitle }</h1>;
}

function SubscriberHighlightsListing( { siteId }: { siteId: number | null } ) {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	// Check if the site has any paid subscription products added.
	// Intentionally not using `getProductsForSiteId` here because we want to show the loading state.
	const products = useSelector( ( state ) => state.memberships?.productList?.items[ siteId ?? 0 ] );

	// Odyssey Stats doesn't support the membership API endpoint yet.
	// Products with an `undefined` value rather than an empty array means the API call has not been completed yet.
	const hasAddedPaidSubscriptionProduct = ! isOdysseyStats && products && products.length > 0;
	const isPaidSubscriptionProductsLoading = ! isOdysseyStats && ! products;

	const highlights = useSubscriberHighlights( siteId, hasAddedPaidSubscriptionProduct );

	return (
		<div className="highlight-cards-list">
			{ siteId && ! isOdysseyStats && <QueryMembershipProducts siteId={ siteId } /> }
			{ highlights.map(
				( highlight ) =>
					highlight.show && (
						<CountComparisonCard
							compact={ true }
							key={ highlight.heading }
							heading={ isPaidSubscriptionProductsLoading ? '-' : highlight.heading }
							count={ isPaidSubscriptionProductsLoading ? null : highlight.count }
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
