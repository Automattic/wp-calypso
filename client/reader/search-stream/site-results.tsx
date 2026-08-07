import { ReadFeedSearchSort } from '@automattic/api-core';
import { useTranslate } from 'i18n-calypso';
import { useCallback, type ComponentType } from 'react';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderInfiniteStream from 'calypso/reader/components/reader-infinite-stream';
import { siteRowRenderer } from 'calypso/reader/components/reader-infinite-stream/row-renderers';
import { SEARCH_RESULTS_SITES } from 'calypso/reader/follow-sources';
import { MAX_POSTS_FOR_LOGGED_OUT_USERS } from 'calypso/reader/reader.const';

interface ReaderFeed {
	feed_ID?: string | number;
	[ key: string ]: unknown;
}

interface Props {
	query: string;
	sort?: ReadFeedSearchSort;
	searchResults?: ReaderFeed[];
	hasNextPage?: boolean;
	isLoading?: boolean;
	fetchNextPage: () => void;
	isLoggedIn?: boolean;
	width: number;
}

// Logged-out users get a login prompt after a few results, which stops the stream.
const isLoginPromptVisible = ( isLoggedIn: boolean | undefined, offset: number ) =>
	! isLoggedIn && offset > MAX_POSTS_FOR_LOGGED_OUT_USERS;

function SiteResults( {
	query,
	searchResults,
	hasNextPage,
	isLoading,
	fetchNextPage,
	isLoggedIn,
	width,
}: Props ) {
	const translate = useTranslate();

	const handleLoadMore = useCallback(
		( offset: number ) => {
			if ( isLoginPromptVisible( isLoggedIn, offset ) ) {
				return;
			}
			fetchNextPage();
		},
		[ isLoggedIn, fetchNextPage ]
	);

	const hasMore = useCallback(
		( offset: number ) => {
			if ( isLoginPromptVisible( isLoggedIn, offset ) ) {
				return false;
			}
			// Defer to the infinite query's own stop condition (driven by the
			// endpoint's `next_page` handle) rather than comparing the deduped offset
			// to the inflated ES `total`, which never resolves and leaves the stream
			// rendering permanent loading placeholders (READ-601).
			return Boolean( hasNextPage );
		},
		[ isLoggedIn, hasNextPage ]
	);

	const hasResults = ( searchResults?.length ?? 0 ) > 0;
	const isEmpty = query?.length > 0 && ! isLoading && ! hasNextPage && ! hasResults;

	if ( isEmpty ) {
		return (
			<div className="search-stream__site-results-none">{ translate( 'No sites found.' ) }</div>
		);
	}

	return (
		<div>
			<ReaderInfiniteStream
				items={ searchResults || [ {}, {}, {}, {}, {} ] }
				width={ width }
				fetchNextPage={ handleLoadMore }
				hasNextPage={ hasMore }
				rowRenderer={ siteRowRenderer }
				extraRenderItemProps={ {
					showLastUpdatedDate: false,
					showNotificationSettings: false,
					showFollowedOnDate: false,
					followSource: SEARCH_RESULTS_SITES,
				} }
			/>
		</div>
	);
}

export default withDimensions( SiteResults ) as ComponentType< Omit< Props, 'width' > >;
