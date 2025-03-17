import { recordTrainTracksRender } from '@automattic/calypso-analytics';
import { Reader } from '@automattic/data-stores';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useMemo } from 'react';
import ReaderFeedItem from 'calypso/blocks/reader-feed-item';
import { SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST } from 'calypso/landing/subscriptions/tracks';
import './style.scss';

const ReaderUnsubscribedFeedsSearchList = () => {
	const { feedItems, searchQueryResult } = Reader.useUnsubscribedFeedsSearch() ?? {};

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
				/>
			);
		} );
	}, [ feedItems ] );

	if ( ! feedItemComponents?.length || searchQueryResult?.isFetching ) {
		return null;
	}

	return (
		<VStack as="ul" className="reader-unsubscribed-feeds-search-list">
			{ feedItemComponents }
		</VStack>
	);
};

export default ReaderUnsubscribedFeedsSearchList;
