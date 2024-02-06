import config from '@automattic/calypso-config';
import { ComponentSwapper, CountComparisonCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import QueryMembershipProducts from 'calypso/components/data/query-memberships';
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
	const isPaidSubscriptionProductsLoading = ! isOdysseyStats && ! products;
	const hasAddedPaidSubscriptionProduct = ! isOdysseyStats && products && products.length > 0;

	const highlights = useSubscriberHighlights( siteId, hasAddedPaidSubscriptionProduct );

	const standardHighlights = (
		<div className="highlight-cards-list">
			{ highlights.map( ( highlight ) => (
				<CountComparisonCard
					key={ highlight.heading }
					heading={ isPaidSubscriptionProductsLoading ? '-' : highlight.heading }
					count={ isPaidSubscriptionProductsLoading ? null : highlight.count }
					showValueTooltip
					note={ highlight.note }
				/>
			) ) }
		</div>
	);

	const mobileHighlights = (
		<div className="highlight-cards-list-mobile">
			{ highlights.map( ( highlight ) => (
				<div className="highlight-cards-list-mobile__item">
					<span className="highlight-cards-list-mobile__item-heading">{ highlight.heading }</span>
					<span className="highlight-cards-list-mobile__item-count">
						{ isPaidSubscriptionProductsLoading ? '-' : highlight.count }
					</span>
				</div>
			) ) }
		</div>
	);

	return (
		<>
			{ siteId && ! isOdysseyStats && <QueryMembershipProducts siteId={ siteId } /> }
			<ComponentSwapper
				breakpoint="<660px"
				breakpointActiveComponent={ mobileHighlights }
				breakpointInactiveComponent={ standardHighlights }
			/>
		</>
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
