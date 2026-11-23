import { agencyAnnouncementsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useMemo, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Card, CardDivider } from '../../components/card';
import { NewsRow } from '../overview/news';
import type { AgencyAnnouncement, AgencyAnnouncementLogo } from '@automattic/api-core';

import '../overview/news/style.scss';

export type MarketplacePromoPlacement = 'hosting' | 'products';

const NO_ANNOUNCEMENTS: AgencyAnnouncement[] = [];

const TRACKS_EVENTS: Record< MarketplacePromoPlacement, { open: string; ctaClick: string } > = {
	hosting: {
		open: 'calypso_a4a_hosting_announcement_open',
		ctaClick: 'calypso_a4a_hosting_announcement_cta_click',
	},
	products: {
		open: 'calypso_a4a_products_announcement_open',
		ctaClick: 'calypso_a4a_products_announcement_cta_click',
	},
};

/**
 * The Overview's News and updates items for the products a Marketplace page sells,
 * in the server's order. The server already decides which agencies see an item and
 * when, so the page only narrows the list to the products it's about. Pass a constant
 * `logos` array, so the list isn't filtered again on every render.
 */
export function useMarketplacePromos( agencyId: number, logos: readonly AgencyAnnouncementLogo[] ) {
	const { data = NO_ANNOUNCEMENTS } = useQuery( agencyAnnouncementsQuery( agencyId ) );
	return useMemo( () => data.filter( ( item ) => logos.includes( item.logo ) ), [ data, logos ] );
}

/**
 * Promos at the top of a Marketplace page, in the Overview's collapsible rows. A page
 * that already lists what a promo's primary CTA leads to leaves that CTA out.
 */
export default function MarketplacePromos( {
	announcements,
	placement,
	hidePrimaryCta = false,
}: {
	announcements: AgencyAnnouncement[];
	placement: MarketplacePromoPlacement;
	hidePrimaryCta?: boolean;
} ) {
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
						canToggle
						onToggle={ () => {
							if ( openItemId === announcement.id ) {
								setOpenId( null );
								return;
							}
							recordTracksEvent( TRACKS_EVENTS[ placement ].open, {
								announcement_id: announcement.id,
								announcement_type: announcement.type,
							} );
							setOpenId( announcement.id );
						} }
						recordTracksEvent={ recordTracksEvent }
						ctaEventName={ TRACKS_EVENTS[ placement ].ctaClick }
						hidePrimaryCta={ hidePrimaryCta }
					/>
				</Fragment>
			) ) }
		</Card>
	);
}
