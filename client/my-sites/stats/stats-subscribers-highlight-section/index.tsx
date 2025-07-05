import { ComponentSwapper, Spinner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import QueryMembershipProducts from 'calypso/components/data/query-memberships';
import CountCard from 'calypso/my-sites/stats/components/highlight-cards/count-card';
import MobileHighlightCardListing from 'calypso/my-sites/stats/components/highlight-cards/mobile-highlight-cards';
import useSubscribersOverview from 'calypso/my-sites/stats/hooks/use-subscribers-overview';
import { useSelector } from 'calypso/state';
import './style.scss';
import useSubscribersTotalsQueries from '../hooks/use-subscribers-totals-query';

function useSubscriberHighlights(
	siteId: number | null,
	hasAddedPaidSubscriptionProduct: boolean
) {
	const translate = useTranslate();

	const {
		data: subscribersTotals,
		isLoading: isSubscribersTotalLoading,
		isError: isSubscribersTotalError,
	} = useSubscribersTotalsQueries( siteId );

	const {
		overviewData,
		isLoading: isOverviewDataLoading,
		isError: isOverviewDataError,
	} = useSubscribersOverview( siteId, ! hasAddedPaidSubscriptionProduct );

	const isLoading = isSubscribersTotalLoading || isOverviewDataLoading;
	const isError = isSubscribersTotalError || isOverviewDataError;

	let highlights = [
		{
			heading: translate( 'Total subscribers' ),
			count: subscribersTotals?.total,
			note: translate( 'Total subscribers excluding social media subscribers' ),
		},
	] as { heading: string; count: number | null; note?: string }[];

	if ( hasAddedPaidSubscriptionProduct ) {
		highlights = highlights.concat( [
			{
				heading: translate( 'Paid subscribers' ),
				count: subscribersTotals?.paid_subscribers || 0,
				note: translate( 'Paid WordPress.com subscribers' ),
			},
			{
				heading: translate( 'Free subscribers' ),
				count: subscribersTotals?.free_subscribers,
				note: translate( 'Email subscribers and free WordPress.com subscribers' ),
			},
		] );
	} else {
		highlights = highlights.concat( overviewData );
	}

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

type HighlightData = {
	heading: string;
	count: number | null;
	note?: string | undefined;
};

type SubscriberHighlightsRenderProps = {
	highlights: HighlightData[];
	isLoading: boolean;
};

function SubscriberHighlightsStandard( {
	highlights,
	isLoading,
}: SubscriberHighlightsRenderProps ) {
	const translate = useTranslate();

	return (
		<div className="highlight-cards-list">
			{ highlights.map( ( highlight ) => (
				<CountCard
					heading={ isLoading ? '-' : highlight.heading }
					key={ highlight.heading }
					showValueTooltip
					label={ translate( 'subscribers' ) }
					note={ highlight.note }
					value={ isLoading ? null : highlight.count }
				/>
			) ) }
		</div>
	);
}

function SubscriberHighlightsMobile( { highlights, isLoading }: SubscriberHighlightsRenderProps ) {
	if ( isLoading ) {
		return <Spinner baseClassName="calypso-spinner" />;
	}

	return <MobileHighlightCardListing highlights={ highlights } />;
}

export default function SubscribersHighlightSection( { siteId }: { siteId: number | null } ) {
	const translate = useTranslate();
	const localizedTitle = translate( 'All-time stats', {
		comment: 'Heading for Subscribers page highlights section',
	} );

	// Check if the site has any paid subscription products added.
	// Intentionally not using getProductsForSiteId here because we want to show the loading state.
	const products = useSelector( ( state ) => state.memberships?.productList?.items[ siteId ?? 0 ] );

	// Products with an undefined value rather than an empty array means the API call has not been completed yet.
	const isPaidSubscriptionProductsLoading = ! products;
	const hasAddedPaidSubscriptionProduct = products && products.length > 0;

	const highlights = useSubscriberHighlights( siteId, hasAddedPaidSubscriptionProduct );

	return (
		<div className="highlight-cards subscribers-page has-odyssey-stats-bg-color">
			<h1 className="highlight-cards-heading">{ localizedTitle }</h1>
			{ siteId && <QueryMembershipProducts siteId={ siteId } /> }
			<ComponentSwapper
				breakpoint="<660px"
				breakpointActiveComponent={
					<SubscriberHighlightsMobile
						highlights={ highlights }
						isLoading={ isPaidSubscriptionProductsLoading }
					/>
				}
				breakpointInactiveComponent={
					<SubscriberHighlightsStandard
						highlights={ highlights }
						isLoading={ isPaidSubscriptionProductsLoading }
					/>
				}
			/>
		</div>
	);
}
