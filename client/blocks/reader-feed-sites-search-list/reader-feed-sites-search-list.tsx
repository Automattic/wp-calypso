import { Reader } from '@automattic/data-stores';
import { __experimentalVStack as VStack } from '@wordpress/components';
import ReaderFeedSiteItem from './reader-feed-site-item';
import './style.scss';

const ReaderFeedSitesSearchList = () => {
	const { feedItems, searchQueryResult } = Reader.useReadFeedSearch() ?? {};

	if ( ! feedItems?.length || searchQueryResult?.isFetching ) {
		return null;
	}

	return (
		<VStack as="ul" className="reader-feed-sites-search-list">
			{ feedItems.map( ( feed ) => {
				return <ReaderFeedSiteItem key={ feed.feed_ID } feed={ feed } />;
			} ) }
		</VStack>
	);
};

export default ReaderFeedSitesSearchList;
