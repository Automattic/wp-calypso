import './style.scss';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { __experimentalVStack as VStack, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import ReaderFeedItem from 'calypso/blocks/reader-feed-item';
import FeedPreview from 'calypso/landing/subscriptions/components/feed-preview';
import { SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST } from 'calypso/landing/subscriptions/tracks';

const { useSiteSubscriptionsQuery, useSiteUnsubscribeMutation, useSiteSubscriptionsQueryProps } =
	SubscriptionManager;
const { useReadFeedSearchQuery } = Reader;

export const UnsubscribedFeedsSearchList = () => {
	const { searchTerm } = useSiteSubscriptionsQueryProps();
	const { isPending: isUnsubscribing } = useSiteUnsubscribeMutation();
	const translate = useTranslate();

	const {
		data: { subscriptions },
		isFetching: isFetchingSubscriptions,
	} = useSiteSubscriptionsQuery();

	const {
		data,
		isFetching: isFetchingUnsubscribedFeeds,
		error: searchError,
	} = useReadFeedSearchQuery( {
		query: searchTerm,
		excludeFollowed: true,
	} );

	const unsubscribedFeedItems = data?.feeds;
	const noFeedsFound =
		( unsubscribedFeedItems?.length === 0 && ! isFetchingUnsubscribedFeeds ) || searchError;

	// To avoid showing duplicate feed items between subscribed and unsubscribed feeds.
	const filteredUnsubscribedFeedItems = ( unsubscribedFeedItems ?? [] ).filter(
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

	if ( filteredUnsubscribedFeedItems.length === 1 ) {
		const feed = filteredUnsubscribedFeedItems[ 0 ];
		return (
			<FeedPreview
				key={ `feed-preview-${ feed.blog_ID }-${ feed.feed_ID }` }
				url={ feed.subscribe_URL }
				source="manage_subscriptions_single_result_feed_preview"
			/>
		);
	}

	if ( noFeedsFound ) {
		return (
			<div className="reader-unsubscribed-feeds-search-list-no-feeds-found">
				{ translate( "Sorry, we couldn't find any sites related to your search." ) }
			</div>
		);
	}

	const shouldShowUnsubcribedFeedsListLoader =
		isFetchingSubscriptions || // If site subscriptions are still fetching.
		isFetchingUnsubscribedFeeds || // If unsubscribed feeds are still fetching.
		isUnsubscribing; // If user is unsubscribing from subscriptions table.

	if ( shouldShowUnsubcribedFeedsListLoader ) {
		return (
			<div className="reader-unsubscribed-feeds-search-list-loader" role="status" aria-busy="true">
				<Spinner />
			</div>
		);
	}

	return (
		<VStack spacing={ 4 }>
			<VStack as="ul" className="reader-unsubscribed-feeds-search-list">
				{ filteredUnsubscribedFeedItems?.map( ( feed, index ) => (
					<ReaderFeedItem
						key={ `${ feed.blog_ID }-${ feed.feed_ID }` }
						feed={ feed }
						source={ SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST }
						railcarExtra={ {
							uiPosition: index,
						} }
						shouldHideOnSubscribedState
					/>
				) ) }
			</VStack>
		</VStack>
	);
};

export default UnsubscribedFeedsSearchList;
