import { useTranslate } from 'i18n-calypso';
import { ReaderSiteItem } from 'calypso/reader/sites-list/site-item';
import type { PublicListItem } from './use-public-list-query';

import './list-sites-directory.scss';

interface ListSitesDirectoryProps {
	items: PublicListItem[];
	followSource: string;
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

	return (
		<div className="list-sites-directory">
			{ items
				.filter( ( item ) => item.site_url )
				.map( ( item ) => (
					<div key={ `list-site-${ item.feed_id }` } className="list-sites-directory__site">
						<ul className="reader-sites-list is-default-view">
							<ReaderSiteItem
								site={ {
									siteId: item.blog_id ? String( item.blog_id ) : undefined,
									feedId: String( item.feed_id ),
									name: item.site_name,
									feedUrl: item.site_url,
								} }
								followSource={ followSource }
								variant="default"
							/>
						</ul>
					</div>
				) ) }
		</div>
	);
}
