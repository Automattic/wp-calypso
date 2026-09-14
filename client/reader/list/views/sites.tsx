import { readListItemsInfiniteQuery } from '@automattic/api-queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { ReaderList } from 'calypso/reader/list-manage/types';
import { ReaderSitesList } from 'calypso/reader/sites-list';
import ListEmpty from '../components/empty';
import type { ReadListItem } from '@automattic/api-core';
import type { ReaderSite } from 'calypso/reader/sites-list/site-item';

interface ListSitesProps {
	list?: ReaderList;
}

export default function ListSites( props: ListSitesProps ) {
	const translate = useTranslate();
	const { list } = props;
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
		readListItemsInfiniteQuery( list?.owner ?? '', list?.slug ?? '', 'feed,site' ) // Adding meta to include feed and site data in each list item.
	);
	const { ref: spinnerRef, inView } = useInView();

	useEffect( () => {
		if ( inView && hasNextPage && ! isFetchingNextPage ) {
			fetchNextPage();
		}
	}, [ inView, hasNextPage, isFetchingNextPage, fetchNextPage ] );

	if ( isLoading ) {
		return (
			<div className="wp-spinner-wrapper">
				<Spinner />
				<p>{ translate( 'Loading sites' ) }</p>
			</div>
		);
	}

	const items = data?.pages.flatMap( ( page ) => page.items );
	if ( ! items?.length ) {
		return <ListEmpty list={ list } />;
	}

	function normalizeListItem( item: ReadListItem ): ReaderSite {
		// The API response may include feed data, site data, or both for each list item.
		const feed = item.meta?.data?.feed;
		const site = item.meta?.data?.site;

		return {
			siteId: feed?.blog_ID || String( site?.ID ?? '' ),
			feedId: feed?.feed_ID || String( site?.feed_ID ?? '' ),
			name: feed?.name || site?.name,
			feedUrl: feed?.feed_URL || site?.feed_URL,
			image: feed?.image || ( site?.icon?.img ?? site?.icon?.ico ),
		};
	}

	return (
		<>
			<ReaderSitesList
				sites={ items.map( normalizeListItem ) }
				followSource="reader-list-sites-tab"
				variant="card"
			/>

			<div ref={ spinnerRef }>
				{ isFetchingNextPage && (
					<div className="wp-spinner-wrapper" style={ { marginTop: '0' } }>
						<Spinner />
					</div>
				) }
			</div>
		</>
	);
}
