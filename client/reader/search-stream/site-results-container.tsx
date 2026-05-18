import { ReadFeedSearchSort } from '@automattic/api-core';
import { readFeedSearchInfiniteQuery } from '@automattic/api-queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import SiteResults from './site-results';

// The dedup walks an array containing entries from two sources with slightly
// different shapes — the React Query results (`ReadFeedItem`) and the canonical
// feed objects from `state.reader.feeds.items` (a looser shape populated by
// other Reader queries). `ReaderFeed` is the loose intersection consumed by
// `siteRowRenderer` downstream.
interface ReaderFeed {
	feed_ID?: string | number;
	feed_URL?: string;
	subscribe_URL?: string;
	[ key: string ]: unknown;
}

interface SiteResultsContainerProps {
	query: string;
	sort: ReadFeedSearchSort;
	onReceiveSearchResults: ( feeds: ReaderFeed[] ) => void;
}

const stripScheme = ( url: string | undefined ): string | undefined =>
	url?.replace( /^https?:\/\//, '' );

interface ReaderFeedsState {
	reader: { feeds: { items: Record< string, ReaderFeed > } };
}

export default function SiteResultsContainer( {
	query,
	sort,
	onReceiveSearchResults,
}: SiteResultsContainerProps ) {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const feedsItems = useSelector( ( state: ReaderFeedsState ) => state.reader.feeds.items );

	const { data, fetchNextPage } = useInfiniteQuery(
		readFeedSearchInfiniteQuery( { query, excludeFollowed: false, sort } )
	);

	const dedupedFeeds = useMemo( () => {
		const allFeeds: ReaderFeed[] =
			data?.pages.flatMap( ( page ) => ( page.feeds ?? [] ) as unknown as ReaderFeed[] ) ?? [];
		if ( allFeeds.length === 0 ) {
			return undefined;
		}
		return allFeeds.reduce< ReaderFeed[] >( ( unique, feed ) => {
			const stripped = stripScheme( feed.subscribe_URL );
			const found = unique.find(
				( u ) =>
					( ! feed.feed_ID && u.subscribe_URL && stripScheme( u.subscribe_URL ) === stripped ) ||
					( feed.feed_ID != null && u.feed_ID === feed.feed_ID )
			);
			if ( ! found ) {
				let resolved: ReaderFeed = feed;
				if ( feed.feed_ID != null && String( feed.feed_ID ).length > 0 ) {
					const existing = feedsItems[ String( feed.feed_ID ) ];
					if ( existing ) {
						resolved = existing;
					}
				}
				unique.push( resolved );
			}
			return unique;
		}, [] );
	}, [ data, feedsItems ] );

	useEffect( () => {
		if ( dedupedFeeds && dedupedFeeds.length > 0 ) {
			onReceiveSearchResults( dedupedFeeds );
		}
	}, [ dedupedFeeds, onReceiveSearchResults ] );

	const total = data?.pages?.[ 0 ]?.total ?? 0;
	const cappedTotal = Math.min( total, 200 );

	return (
		<SiteResults
			query={ query }
			sort={ sort }
			searchResults={ dedupedFeeds }
			searchResultsCount={ cappedTotal }
			isLoggedIn={ isLoggedIn }
			fetchNextPage={ () => fetchNextPage() }
		/>
	);
}
