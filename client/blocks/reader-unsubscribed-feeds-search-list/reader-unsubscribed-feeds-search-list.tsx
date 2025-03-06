import { Reader } from '@automattic/data-stores';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useMemo } from 'react';
import ReaderFeedItemRow from 'calypso/blocks/reader-feed-item';
import { SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST } from 'calypso/landing/subscriptions/tracks';
import './style.scss';

const ReaderUnsubscribedFeedsSearchList = () => {
	const { feedItems, searchQueryResult } = Reader.useUnsubscribedFeedsSearch() ?? {};

	const feedItemComponents = useMemo( () => {
		if ( ! feedItems?.length ) {
			return [];
		}

		return feedItems?.map( ( feed, index ): JSX.Element | null => {
			if ( ! feed.feed_ID ) {
				return null;
			}

			return (
				<ReaderFeedItemRow
					key={ `${ feed.blog_ID }-${ feed.feed_ID }` }
					blogId={ feed.blog_ID ?? null } // null is used for non-wpcom feeds.
					feedId={ feed.feed_ID }
					uiPosition={ index }
					railcar={ feed.railcar }
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
