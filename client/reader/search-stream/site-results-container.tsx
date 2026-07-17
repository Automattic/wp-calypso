import { ReadFeedSearchSort } from '@automattic/api-core';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useFeedSearchInfiniteQuery } from 'calypso/reader/data/feed';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import SiteResults from './site-results';

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

export default function SiteResultsContainer( {
	query,
	sort,
	onReceiveSearchResults,
}: SiteResultsContainerProps ) {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const { data, fetchNextPage, hasNextPage } = useFeedSearchInfiniteQuery( {
		query,
		excludeFollowed: false,
		sort,
	} );

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
				unique.push( feed );
			}
			return unique;
		}, [] );
	}, [ data ] );

	useEffect( () => {
		if ( dedupedFeeds && dedupedFeeds.length > 0 ) {
			onReceiveSearchResults( dedupedFeeds );
		}
	}, [ dedupedFeeds, onReceiveSearchResults ] );

	return (
		<SiteResults
			query={ query }
			sort={ sort }
			searchResults={ dedupedFeeds }
			hasNextPage={ hasNextPage }
			isLoggedIn={ isLoggedIn }
			fetchNextPage={ () => fetchNextPage() }
		/>
	);
}
