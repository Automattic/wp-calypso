import './style.scss';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { __experimentalVStack as VStack, Spinner } from '@wordpress/components';
import ReaderFeedItem from 'calypso/blocks/reader-feed-item';
import { SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST } from 'calypso/landing/subscriptions/tracks';
import { RailcarRenderer } from './railcar-renderer';

interface ReaderUnsubscribedFeedsSearchListProps {
	title?: React.ReactNode;
}

const { useSiteSubscriptionsQuery, useSiteUnsubscribeMutation, useSiteSubscriptionsQueryProps } =
	SubscriptionManager;
const { useReadFeedSearchQuery } = Reader;

const ReaderUnsubscribedFeedsSearchList = ( props: ReaderUnsubscribedFeedsSearchListProps ) => {
	const { title } = props;
	const { searchTerm } = useSiteSubscriptionsQueryProps();
	const { isPending: isUnsubscribing } = useSiteUnsubscribeMutation();

	const {
		data: { subscriptions },
		isFetching: isFetchingSubscriptions,
	} = useSiteSubscriptionsQuery();

	const { data, isFetching: isFetchingUnsubscribedFeeds } = useReadFeedSearchQuery( {
		query: searchTerm,
		excludeFollowed: true,
	} );

	const unsubscribedFeedItems = data?.feeds;

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
				{ filteredUnsubscribedFeedItems?.map( ( feed, index ) => (
					<RailcarRenderer
						key={ `${ feed.blog_ID }-${ feed.feed_ID }` }
						feed={ feed }
						customProps={ {
							index: index ?? -1,
						} }
					>
						<ReaderFeedItem
							feed={ feed }
							source={ SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST }
						/>
					</RailcarRenderer>
				) ) }
			</VStack>
		</VStack>
	);
};

export default ReaderUnsubscribedFeedsSearchList;
