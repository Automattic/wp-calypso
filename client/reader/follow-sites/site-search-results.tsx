import { ReadFeedSearchSort } from '@automattic/api-core';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import ConnectedReaderSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/connected';
import { addQueryArgs } from 'calypso/lib/url';
import { useFeedSearchInfiniteQuery, type Feed } from 'calypso/reader/data/feed';
import { READER_FOLLOW_SITES_SEARCH } from 'calypso/reader/follow-sources';
import type { JSX } from 'react';

interface SiteSearchResultsProps {
	query: string;
}

const stripScheme = ( url: string | undefined ): string | undefined =>
	url?.replace( /^https?:\/\//, '' );

/**
 * The feed search endpoint can return the same site more than once across
 * pages (or as separate feed rows for non-WP.com URLs), so collapse duplicates
 * by feed ID and, failing that, by scheme-less feed URL.
 */
export function dedupeFeeds( feeds: Feed[] ): Feed[] {
	return feeds.reduce< Feed[] >( ( unique, feed ) => {
		const stripped = stripScheme( feed.feed_URL );
		const isDuplicate = unique.some( ( existing ) =>
			feed.feed_ID
				? existing.feed_ID === feed.feed_ID
				: Boolean( stripped ) && stripScheme( existing.feed_URL ) === stripped
		);
		if ( ! isDuplicate ) {
			unique.push( feed );
		}
		return unique;
	}, [] );
}

export default function SiteSearchResults( { query }: SiteSearchResultsProps ): JSX.Element {
	const translate = useTranslate();
	const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
		useFeedSearchInfiniteQuery( {
			query,
			excludeFollowed: false,
			sort: ReadFeedSearchSort.Relevance,
		} );

	const feeds = useMemo(
		() => dedupeFeeds( data?.pages.flatMap( ( page ) => page.feeds ) ?? [] ),
		[ data ]
	);

	const isEmpty = ! isLoading && feeds.length === 0;

	return (
		<div className="follow-sites__results">
			{ ! isEmpty && <h2 className="follow-sites__section-title">{ translate( 'Sites' ) }</h2> }
			{ isEmpty && (
				<p className="follow-sites__empty">
					{ translate( 'Nothing matched “%(query)s”. Paste a site address to add it by RSS.', {
						args: { query },
					} ) }
				</p>
			) }
			<div className="follow-sites__list">
				{ feeds.map( ( feed ) => (
					<ConnectedReaderSubscriptionListItem
						key={ feed.feed_ID || feed.feed_URL }
						feedId={ feed.feed_ID || undefined }
						siteId={ feed.blog_ID || undefined }
						url={ feed.feed_URL }
						showLastUpdatedDate={ false }
						showNotificationSettings={ false }
						showFollowedOnDate={ false }
						followSource={ READER_FOLLOW_SITES_SEARCH }
					/>
				) ) }
			</div>
			{ hasNextPage && (
				<Button
					className="follow-sites__load-more"
					variant="link"
					isBusy={ isFetchingNextPage }
					disabled={ isFetchingNextPage }
					onClick={ () => fetchNextPage() }
				>
					{ translate( 'Load more sites' ) }
				</Button>
			) }
			<Button
				className="follow-sites__search-posts"
				variant="link"
				href={ addQueryArgs( { q: query }, '/reader/search' ) }
			>
				{ translate( 'Search posts for “%(query)s”', { args: { query } } ) }
			</Button>
		</div>
	);
}
