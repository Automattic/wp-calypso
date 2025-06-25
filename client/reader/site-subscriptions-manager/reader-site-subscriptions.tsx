import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { UnsubscribedFeedsSearchList } from 'calypso/blocks/reader-unsubscribed-feeds-search-list';
import {
	SiteSubscriptionsList,
	SiteSubscriptionsListActionsBar,
} from 'calypso/landing/subscriptions/components/site-subscriptions-list';
import {
	useRecordSearchPerformed,
	useRecordSearchByUrlPerformed,
} from 'calypso/landing/subscriptions/tracks';
import { resemblesUrl } from 'calypso/lib/url';
import { RecommendedSites } from '../recommended-sites';
import { getUrlQuerySearchTerm, SEARCH_QUERY_PARAM, setUrlQuery } from '../utils';
import NotFoundSiteSubscriptions from './not-found-site-subscriptions';

const ReaderSiteSubscriptions = () => {
	const translate = useTranslate();
	const { searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();
	const {
		data: { subscriptions },
		isFetching,
	} = SubscriptionManager.useSiteSubscriptionsQuery() ?? {};
	const { feedItems: unsubscribedFeedItems, searchQueryResult } =
		Reader.useUnsubscribedFeedsSearch() ?? {};
	const { isPending: isUnsubscribing } = SubscriptionManager.useSiteUnsubscribeMutation();

	// To avoid showing duplicate feed items between subscribed and unsubscribed feeds.
	const filteredUnsubscribedFeedItems = unsubscribedFeedItems?.filter(
		( feedItem: Reader.FeedItem ): boolean => {
			const isDuplicate = subscriptions.find(
				( subscription ): boolean =>
					! subscription.isDeleted &&
					// For match either compare feed_ID or URL.
					( subscription.feed_ID === feedItem.feed_ID ||
						subscription.URL === feedItem.subscribe_URL )
			);

			return ! isDuplicate;
		}
	);

	const hasSomeSubscriptions = subscriptions.length > 0;
	const hasSomeUnsubscribedSearchResults = ( filteredUnsubscribedFeedItems?.length ?? 0 ) > 0;

	const recordSearchPerformed = useRecordSearchPerformed();
	const recordSearchByUrlPerformed = useRecordSearchByUrlPerformed();

	// Update url query when search term changes
	useEffect( () => {
		setUrlQuery( SEARCH_QUERY_PARAM, searchTerm );
	}, [ searchTerm ] );

	useEffect( () => {
		if ( searchTerm ) {
			recordSearchPerformed( { query: searchTerm } );
			if ( resemblesUrl( searchTerm ) ) {
				recordSearchByUrlPerformed( { url: searchTerm } );
			}
		}
	}, [ searchTerm, recordSearchPerformed, recordSearchByUrlPerformed ] );

	const shouldShowUnsubcribedFeedsListLoader =
		isFetching || // If site subscriptions are still fetching.
		( searchQueryResult?.isFetching ?? false ) || // If unsubscribed feeds are still fetching.
		isUnsubscribing; // If user is unsubscribing from subscriptions table.

	return (
		<>
			<SiteSubscriptionsListActionsBar />
			<SiteSubscriptionsList notFoundComponent={ NotFoundSiteSubscriptions } />
			{ ! searchTerm && <RecommendedSites /> }

			{ hasSomeSubscriptions && hasSomeUnsubscribedSearchResults && (
				<div className="site-subscriptions__search-recommendations-label">
					{ translate( 'Here are some other sites that match your search.' ) }
				</div>
			) }

			{ hasSomeUnsubscribedSearchResults && (
				<UnsubscribedFeedsSearchList
					feedItems={ filteredUnsubscribedFeedItems }
					isLoading={ shouldShowUnsubcribedFeedsListLoader }
				/>
			) }
		</>
	);
};

export default () => (
	<SubscriptionManager.SiteSubscriptionsQueryPropsProvider
		initialSearchTermState={
			getUrlQuerySearchTerm // Take the `?s=` url query param and set is as initial search term state.
		}
	>
		<Reader.UnsubscribedFeedsSearchProvider>
			<ReaderSiteSubscriptions />
		</Reader.UnsubscribedFeedsSearchProvider>
	</SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
);
