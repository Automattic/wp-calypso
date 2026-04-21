import { readListItemsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ReaderSitesList } from 'calypso/reader/sites-list';
import ListEmpty from '../components/empty';
import type { ReadListItem } from '@automattic/api-core';
import type { ReaderSite } from 'calypso/reader/sites-list/site-item';

interface ListSitesProps {
	list: {
		title: string;
		owner: string;
		slug: string;
		is_owner: boolean;
		ID: number;
	};
}

export default function ListSites( props: ListSitesProps ) {
	const translate = useTranslate();
	const { list } = props;
	const { data, isLoading } = useQuery( readListItemsQuery( list.owner, list.slug ) );

	if ( isLoading ) {
		return (
			<div className="wp-spinner-wrapper">
				<Spinner />
				<p>{ translate( 'Loading sites' ) }</p>
			</div>
		);
	}

	const items = data?.items;
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
		<ReaderSitesList
			sites={ items.map( normalizeListItem ) }
			followSource="reader-list-sites-tab"
			variant="card"
		/>
	);
}
