import { Reader } from '@automattic/data-stores';
import { __experimentalVStack as VStack } from '@wordpress/components';
import ReaderUnsubscribedFeedItem from './reader-unsubscribed-feed-item';
import './style.scss';

const ReaderUnsubscribedFeedsSearchList = () => {
	const { feedItems, searchQueryResult } = Reader.useUnsubscribedFeedsSearch() ?? {};

	if ( ! feedItems?.length || searchQueryResult?.isFetching ) {
		return null;
	}

	return (
		<VStack as="ul" className="reader-unsubscribed-feeds-search-list">
			{ feedItems.map( ( feed ) => {
				return (
					<ReaderUnsubscribedFeedItem key={ `${ feed.blog_ID }-${ feed.feed_ID }` } feed={ feed } />
				);
			} ) }
		</VStack>
	);
};

export default ReaderUnsubscribedFeedsSearchList;
