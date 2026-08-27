import { useTranslate } from 'i18n-calypso';
import ConnectedReaderSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/connected';
import { useInfiniteStream } from 'calypso/reader/data/stream';
import { READER_FOLLOW_SITES_POPULAR } from 'calypso/reader/follow-sources';
import type { JSX } from 'react';

export const POPULAR_SITES_STREAM_KEY = 'custom_recs_sites_with_images';

interface PopularSiteItem {
	blogId?: number;
	feed_ID?: number;
	feed_URL?: string;
	url?: string;
	site_name?: string;
}

export default function PopularSites(): JSX.Element {
	const translate = useTranslate();
	const { items, isLoading } = useInfiniteStream( { streamKey: POPULAR_SITES_STREAM_KEY } );

	const sites = ( items as unknown as PopularSiteItem[] ).filter(
		( item ) => item.site_name !== undefined && ( item.feed_ID || item.blogId )
	);

	if ( isLoading || sites.length === 0 ) {
		return <></>;
	}

	return (
		<section className="follow-sites__section">
			<h2 className="follow-sites__section-title">{ translate( 'Popular this week' ) }</h2>
			<div className="follow-sites__list">
				{ sites.map( ( site ) => (
					<ConnectedReaderSubscriptionListItem
						key={ site.feed_ID ?? site.blogId }
						feedId={ site.feed_ID }
						siteId={ site.blogId }
						url={ site.feed_URL ?? site.url }
						showLastUpdatedDate={ false }
						showNotificationSettings={ false }
						showFollowedOnDate={ false }
						followSource={ READER_FOLLOW_SITES_POPULAR }
					/>
				) ) }
			</div>
		</section>
	);
}
