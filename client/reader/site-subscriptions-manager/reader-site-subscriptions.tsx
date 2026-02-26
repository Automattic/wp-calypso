import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { __experimentalVStack as VStack } from '@wordpress/components';
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
	const { searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();
	const {
		data: { subscriptions },
		isFetching,
	} = SubscriptionManager.useSiteSubscriptionsQuery() ?? {};
	const { data, isFetching: isFetchingUnsubscribedFeeds } = Reader.useReadFeedSearchQuery( {
		query: searchTerm,
		excludeFollowed: true,
	} );
	const unsubscribedFeedItems = data?.feeds;
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
		isFetchingUnsubscribedFeeds || // If unsubscribed feeds are still fetching.
		isUnsubscribing; // If user is unsubscribing from subscriptions table.

	return (
		<VStack>
			<SiteSubscriptionsListActionsBar />
			<SiteSubscriptionsList notFoundComponent={ NotFoundSiteSubscriptions } />
			{ ! searchTerm && <RecommendedSites /> }

			{ hasSomeUnsubscribedSearchResults && (
				<UnsubscribedFeedsSearchList
					feedItems={ filteredUnsubscribedFeedItems }
					isLoading={ shouldShowUnsubcribedFeedsListLoader }
				/>
			) }
		</VStack>
	);
};

const ReaderSiteSubscriptionsWrapper = () => (
	<SubscriptionManager.SiteSubscriptionsQueryPropsProvider
		initialSearchTermState={
			getUrlQuerySearchTerm // Take the `?s=` url query param and set is as initial search term state.
		}
	>
		<ReaderSiteSubscriptions />
	</SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
);

export default ReaderSiteSubscriptionsWrapper;
