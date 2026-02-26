import './style.scss';
import { recordTrainTracksRender } from '@automattic/calypso-analytics';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { __experimentalVStack as VStack, Spinner } from '@wordpress/components';
import { useMemo } from 'react';
import ReaderFeedItem from 'calypso/blocks/reader-feed-item';
import { SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST } from 'calypso/landing/subscriptions/tracks';

interface ReaderUnsubscribedFeedsSearchListProps {
	title?: React.ReactNode;
}

const { useSiteSubscriptionsQuery, useSiteUnsubscribeMutation, useSiteSubscriptionsQueryProps } =
	SubscriptionManager;
const { useReadFeedSearchQuery } = Reader;

const ReaderUnsubscribedFeedsSearchList = ( props: ReaderUnsubscribedFeedsSearchListProps ) => {
	const { title } = props;
	const { searchTerm } = useSiteSubscriptionsQueryProps();

	const {
		data: { subscriptions },
		isFetching: isFetchingSubscriptions,
	} = useSiteSubscriptionsQuery();

	const { data, isFetching: isFetchingUnsubscribedFeeds } = useReadFeedSearchQuery( {
		query: searchTerm,
		excludeFollowed: true,
	} );

	const unsubscribedFeedItems = data?.feeds;
	const { isPending: isUnsubscribing } = useSiteUnsubscribeMutation();

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

	const shouldShowUnsubcribedFeedsListLoader =
		isFetchingSubscriptions || // If site subscriptions are still fetching.
		isFetchingUnsubscribedFeeds || // If unsubscribed feeds are still fetching.
		isUnsubscribing; // If user is unsubscribing from subscriptions table.

	const feedItemComponents = useMemo( () => {
		return filteredUnsubscribedFeedItems?.map( ( feed, index ) => {
			const railcar = feed.railcar;
			if ( railcar ) {
				// reader: railcar, ui_algo: following_manage, ui_position, fetch_algo, fetch_position, rec_blog_id (incorrect: fetch_lang, action)
				// subscriptions: railcar, ui_algo: reader-subscriptions-search, ui_position, fetch_algo, fetch_position, rec_blog_id
				recordTrainTracksRender( {
					railcarId: railcar.railcar,
					uiAlgo: 'reader-subscriptions-search',
					uiPosition: index ?? -1,
					fetchAlgo: railcar.fetch_algo,
					fetchPosition: railcar.fetch_position,
					recBlogId: railcar.rec_blog_id,
				} );
			}

			return (
				<ReaderFeedItem
					key={ `${ feed.blog_ID }-${ feed.feed_ID }` }
					feed={ feed }
					source={ SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST }
					// To avoid showing the "Subscribed" state in the search list.
					// API of this component returns the feed as subscribed before we get filtered data from parent so for a
					// brief time we show "Subscribed" state which quickly goes away so better to not show it at all.
					shouldHideOnSubscribedState
				/>
			);
		} );
	}, [ filteredUnsubscribedFeedItems ] );

	if ( shouldShowUnsubcribedFeedsListLoader ) {
		return (
			<div className="reader-unsubscribed-feeds-search-list-loader">
				<Spinner />
			</div>
		);
	}

	return (
		<VStack spacing={ 4 }>
			{ title }
			<VStack as="ul" className="reader-unsubscribed-feeds-search-list">
				{ feedItemComponents }
			</VStack>
		</VStack>
	);
};

export default ReaderUnsubscribedFeedsSearchList;
