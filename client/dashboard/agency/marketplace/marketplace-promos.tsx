import { agencyAnnouncementsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Card, CardDivider } from '../../components/card';
import { NewsRow } from '../overview/news';
import type { AnnouncementPlacement } from '../overview/news/announcement-parts';
import type { AgencyAnnouncement, AgencyAnnouncementLogo } from '@automattic/api-core';

import '../overview/news/style.scss';

export type MarketplacePromoPlacement = Exclude< AnnouncementPlacement, 'overview' >;

const NO_ANNOUNCEMENTS: AgencyAnnouncement[] = [];

/**
 * Promos at the top of a Marketplace page: the Overview's News and updates items for
 * the products the page sells, in the server's order and the Overview's collapsible rows.
 * The server already decides which agencies see an item and when, so the page only
 * narrows the list to the products it's about. A page that already lists what a promo's
 * primary CTA leads to leaves that CTA out.
 */
export default function MarketplacePromos( {
	agencyId,
	logos,
	placement,
	hidePrimaryCta = false,
}: {
	agencyId: number;
	logos: readonly AgencyAnnouncementLogo[];
	placement: MarketplacePromoPlacement;
	hidePrimaryCta?: boolean;
} ) {
	const { data = NO_ANNOUNCEMENTS } = useQuery( agencyAnnouncementsQuery( agencyId ) );
	const announcements = data.filter( ( item ) => logos.includes( item.logo ) );
	const { recordTracksEvent } = useAnalytics();
	const [ openId, setOpenId ] = useState< string | null | undefined >( undefined );

	if ( ! announcements.length ) {
		return null;
	}

	// As on the Overview, the first item opens until someone picks another or closes it.
	const openItemId =
		openId === undefined ||
		( openId !== null && ! announcements.some( ( { id } ) => id === openId ) )
			? announcements[ 0 ].id
			: openId;

	return (
		<Card className="a4a-news">
			{ announcements.map( ( announcement, index ) => (
				<Fragment key={ announcement.id }>
					{ index > 0 && <CardDivider /> }
					<NewsRow
						announcement={ announcement }
						isOpen={ openItemId === announcement.id }
						// Unlike the Overview, even a single promo can collapse, to free up the page.
						canToggle
						onToggle={ () => {
							if ( openItemId === announcement.id ) {
								setOpenId( null );
								return;
							}
							recordTracksEvent( 'calypso_a4a_overview_news_item_open', {
								placement,
								announcement_id: announcement.id,
								announcement_type: announcement.type,
							} );
							setOpenId( announcement.id );
						} }
						recordTracksEvent={ recordTracksEvent }
						placement={ placement }
						hidePrimaryCta={ hidePrimaryCta }
					/>
				</Fragment>
			) ) }
		</Card>
	);
}
