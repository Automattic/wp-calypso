import './style.scss';
import { recordTrainTracksRender } from '@automattic/calypso-analytics';
import { Reader } from '@automattic/data-stores';
import { __experimentalVStack as VStack, Spinner } from '@wordpress/components';
import { useMemo } from 'react';
import ReaderFeedItem from 'calypso/blocks/reader-feed-item';
import { SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST } from 'calypso/landing/subscriptions/tracks';

interface ReaderUnsubscribedFeedsSearchListProps {
	isLoading: boolean;
	feedItems?: Reader.FeedItem[];
}

const ReaderUnsubscribedFeedsSearchList = ( props: ReaderUnsubscribedFeedsSearchListProps ) => {
	const { feedItems, isLoading } = props;

	const feedItemComponents = useMemo( () => {
		if ( ! feedItems?.length ) {
			return [];
		}

		return feedItems?.map( ( feed, index ): JSX.Element => {
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
	}, [ feedItems ] );

	if ( isLoading ) {
		return (
			<div className="reader-unsubscribed-feeds-search-list-loader">
				<Spinner />
			</div>
		);
	}

	return (
		<VStack as="ul" className="reader-unsubscribed-feeds-search-list">
			{ feedItemComponents }
		</VStack>
	);
};

export default ReaderUnsubscribedFeedsSearchList;
