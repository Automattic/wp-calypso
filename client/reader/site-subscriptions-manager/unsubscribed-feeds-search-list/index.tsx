import './style.scss';
import { readFeedSearchQuery } from '@automattic/api-queries';
import { SubscriptionManager } from '@automattic/data-stores';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import ReaderFeedItem from 'calypso/blocks/reader-feed-item';
import FeedPreview from 'calypso/landing/subscriptions/components/feed-preview';
import { SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST } from 'calypso/landing/subscriptions/tracks';
import { useSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';

const { useSiteUnsubscribeMutation, useSiteSubscriptionsQueryProps } = SubscriptionManager;

interface Props {
	hideTitle?: boolean;
}

export const UnsubscribedFeedsSearchList = ( { hideTitle = false }: Props ) => {
	const { searchTerm } = useSiteSubscriptionsQueryProps();
	const { isPending: isUnsubscribing } = useSiteUnsubscribeMutation();
	const translate = useTranslate();
	const hasSearchTerm = Boolean( searchTerm );
	const { subscriptions, isFetching: isFetchingSubscriptions } = useSiteSubscriptions( {
		fetchAllPages: true,
		enabled: hasSearchTerm,
	} );

	const {
		data,
		isFetching: isFetchingUnsubscribedFeeds,
		error: searchError,
	} = useQuery(
		readFeedSearchQuery( {
			query: searchTerm,
			excludeFollowed: true,
		} )
	);

	const unsubscribedFeedItems = data?.feeds ?? [];
	const noFeedsFound =
		( unsubscribedFeedItems.length === 0 && ! isFetchingUnsubscribedFeeds ) || searchError;

	const shouldShowUnsubcribedFeedsListLoader =
		isFetchingSubscriptions || // If site subscriptions are still fetching.
		isFetchingUnsubscribedFeeds || // If unsubscribed feeds are still fetching.
		isUnsubscribing; // If user is unsubscribing from subscriptions table.

	const hasSubscribedTableResults = subscriptions.some(
		( subscription ) => ! subscription.isDeleted && subscription.is_following
	);

	const getTitle = (): string | null => {
		if (
			hideTitle ||
			! hasSubscribedTableResults ||
			noFeedsFound ||
			unsubscribedFeedItems.length === 0
		) {
			return null;
		}

		if ( unsubscribedFeedItems.length === 1 ) {
			return translate( 'Here is one result that matches your search:' );
		}

		return translate( 'Here are some other sites that match your search:' );
	};

	// Rendered unconditionally by ReaderSiteSubscriptions, so bail out when there's
	// no active search — otherwise the empty feed list reads as "no results found".
	if ( ! hasSearchTerm ) {
		return null;
	}

	if ( noFeedsFound ) {
		return (
			<div className="reader-unsubscribed-feeds-search-list-no-feeds-found">
				{ translate( "Sorry, we couldn't find any sites related to your search." ) }
			</div>
		);
	}

	if ( shouldShowUnsubcribedFeedsListLoader ) {
		return (
			<div className="reader-unsubscribed-feeds-search-list-loader" role="status" aria-busy="true">
				<Spinner />
			</div>
		);
	}

	const title = getTitle();

	if ( unsubscribedFeedItems.length === 1 ) {
		const feed = unsubscribedFeedItems[ 0 ];
		return (
			<VStack spacing={ 4 }>
				{ title && <h2 className="reader-unsubscribed-feeds-search-list-title">{ title }</h2> }
				<FeedPreview
					key={ `feed-preview-${ feed.blog_ID }-${ feed.feed_ID }` }
					url={ feed.subscribe_URL }
					source="manage_subscriptions_single_result_feed_preview"
				/>
			</VStack>
		);
	}

	return (
		<VStack spacing={ 4 }>
			{ title && <h2 className="reader-unsubscribed-feeds-search-list-title">{ title }</h2> }
			<VStack as="ul" className="reader-unsubscribed-feeds-search-list">
				{ unsubscribedFeedItems.map( ( feed, index ) => (
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
