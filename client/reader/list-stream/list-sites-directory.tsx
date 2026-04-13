import { useTranslate } from 'i18n-calypso';
import { ReaderSitesList } from 'calypso/reader/sites-list';
import type { PublicListItem } from './use-public-list-query';
import type { ReaderSite } from 'calypso/reader/sites-list/site-item';

import './list-sites-directory.scss';

interface ListSitesDirectoryProps {
	items: PublicListItem[];
	followSource: string;
}

function mapItemToReaderSite( item: PublicListItem ): ReaderSite {
	return {
		siteId: item.blog_id ? String( item.blog_id ) : undefined,
		feedId: String( item.feed_id ),
		name: item.site_name,
		feedUrl: item.site_url,
	};
}

export function ListSitesDirectory( {
	items,
	followSource,
}: ListSitesDirectoryProps ): JSX.Element {
	const translate = useTranslate();

	if ( ! items || items.length === 0 ) {
		return (
			<div className="list-sites-directory__empty">
				<p>{ translate( 'No sites in this list yet.' ) }</p>
			</div>
		);
	}

	const sites = items.map( mapItemToReaderSite );

	return (
		<div className="list-sites-directory">
			<ReaderSitesList sites={ sites } variant="default" followSource={ followSource } />
			{ items.map(
				( item ) =>
					item.fediverse_handle &&
					item.fediverse_handle_url && (
						<div
							key={ `fediverse-${ item.feed_id }` }
							className="list-sites-directory__fediverse-handle"
							data-feed-id={ item.feed_id }
						>
							<a href={ item.fediverse_handle_url } target="_blank" rel="noopener noreferrer">
								{ item.fediverse_handle }
							</a>
						</div>
					)
			) }
		</div>
	);
}
