import { Reader } from '@automattic/data-stores';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useMemo } from 'react';
import { isNonWpcomFeedItem, isWpcomFeedItem } from 'calypso/reader/helpers/types';
import ReaderUnsubscribedNonWpcomFeedItem from './reader-unsubscribed-non-wpcom-feed-item';
import ReaderUnsubscribedWpcomFeedItem from './reader-unsubscribed-wpcom-feed-item';
import './style.scss';

const ReaderUnsubscribedFeedsSearchList = () => {
	const { feedItems, searchQueryResult } = Reader.useUnsubscribedFeedsSearch() ?? {};

	const feedItemComponents = useMemo( () => {
		if ( ! feedItems?.length ) {
			return [];
		}

		return feedItems?.map( ( feed, index ) => {
			if ( isWpcomFeedItem( feed ) ) {
				return (
					<ReaderUnsubscribedWpcomFeedItem
						key={ `${ feed.blog_ID }-${ feed.feed_ID }` }
						feed={ feed }
						uiPosition={ index }
					/>
				);
			}

			if ( isNonWpcomFeedItem( feed ) ) {
				return (
					<ReaderUnsubscribedNonWpcomFeedItem
						key={ `${ feed.feed_ID }-${ feed.subscribe_URL }` }
						feed={ feed }
						uiPosition={ index }
					/>
				);
			}

			return null;
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
