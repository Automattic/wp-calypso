import { recordTrainTracksRender } from '@automattic/calypso-analytics';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { __experimentalVStack as VStack, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import ReaderFeedItem from 'calypso/blocks/reader-feed-item';
import { SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST } from 'calypso/landing/subscriptions/tracks';
import './style.scss';

const { useSiteSubscriptionsQueryProps, useSiteSubscriptionsQuery, useSiteUnsubscribeMutation } =
	SubscriptionManager;

const ReaderUnsubscribedFeedsSearchList = () => {
	const { searchTerm } = useSiteSubscriptionsQueryProps();
	const { isPending: isUnsubscribing } = useSiteUnsubscribeMutation();
	const translate = useTranslate();
	const {
		data: { subscriptions },
		isSuccess: isFetchingSubscriptionsSuccess,
	} = useSiteSubscriptionsQuery();

	const showUnsubscribedFeedsList =
		searchTerm !== '' && isFetchingSubscriptionsSuccess && ! isUnsubscribing;

	const {
		data: feedItems,
		isFetching: isFetchingUnsubscribedFeeds,
		isSuccess: isSuccessUnsubscribedFeeds,
	} = Reader.useReadFeedSearchQuery(
		{
			excludeFollowed: true,
			query: searchTerm,
		},
		{ enabled: showUnsubscribedFeedsList }
	);


	const hasNoFeedItems = isSuccessUnsubscribedFeeds && ! feedItems?.feeds?.length;

	const feedItemComponents = useMemo( () => {
		const filteredFeedItems = feedItems?.feeds?.filter( ( feedItem: Reader.FeedItem ): boolean => {
			const isDuplicate = ( subscriptions ?? [] ).find(
				( subscription ): boolean =>
					! subscription.isDeleted &&
					// For match either compare feed_ID or URL.
					( subscription.feed_ID === feedItem.feed_ID || subscription.URL === feedItem.subscribe_URL )
			);

			return ! isDuplicate;
		});

		if ( ! filteredFeedItems?.length ) {
			return [];
		}

		return filteredFeedItems?.map( ( feed, index ): JSX.Element => {
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
	}, [ feedItems, subscriptions ] );

	if ( ! showUnsubscribedFeedsList || hasNoFeedItems ) {
		return null;
	}

	return (
		<div className="reader-unsubscribed-feeds-search">
			<h2 className="reader-unsubscribed-feeds-search__heading">
				{ translate( 'Sites related to your search' ) }
			</h2>
			{ isFetchingUnsubscribedFeeds && (
				<div className="reader-unsubscribed-feeds-search-list-loader">
					<Spinner />
					<p>{ translate( 'Loading sites related to your search...' ) }</p>
				</div>
			) }

   			{ ! isFetchingUnsubscribedFeeds && (
				<VStack as="ul" className="reader-unsubscribed-feeds-search-list">
					{ feedItemComponents }
				</VStack>
			) }
		</div>
	);
};

export default ReaderUnsubscribedFeedsSearchList;
