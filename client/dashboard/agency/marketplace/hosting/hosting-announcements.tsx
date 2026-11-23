import { agencyAnnouncementsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useMemo, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { Card, CardDivider } from '../../../components/card';
import { NewsRow } from '../../overview/news';
import type { HostingSection } from '../paths';
import type { AgencyAnnouncement, AgencyAnnouncementLogo } from '@automattic/api-core';

import '../../overview/news/style.scss';

const HOST_LOGOS: Partial< Record< HostingSection, AgencyAnnouncementLogo > > = {
	wpcom: 'wordpress_com',
	pressable: 'pressable',
};
const NO_ANNOUNCEMENTS: AgencyAnnouncement[] = [];

/**
 * The Overview's News and updates items for the hosts this page sells, in the
 * server's order. The server already decides which agencies see an item and when,
 * so the page only narrows the list to WordPress.com and Pressable, or to the one
 * host a section is about.
 */
export function useHostingAnnouncements( agencyId: number, section?: HostingSection ) {
	const { data = NO_ANNOUNCEMENTS } = useQuery( agencyAnnouncementsQuery( agencyId ) );
	return useMemo( () => {
		const logos = section ? [ HOST_LOGOS[ section ] ] : Object.values( HOST_LOGOS );
		return data.filter( ( item ) => logos.includes( item.logo ) );
	}, [ data, section ] );
}

/**
 * The hosting promos at the top of the Hosting page, in the Overview's collapsible rows.
 * A host's own page already lists its plans below, so its promos leave out the primary CTA.
 */
export default function HostingAnnouncements( {
	announcements,
	section,
}: {
	announcements: AgencyAnnouncement[];
	section?: HostingSection;
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
							recordTracksEvent( 'calypso_a4a_hosting_announcement_open', {
								announcement_id: announcement.id,
								announcement_type: announcement.type,
							} );
							setOpenId( announcement.id );
						} }
						recordTracksEvent={ recordTracksEvent }
						ctaEventName="calypso_a4a_hosting_announcement_cta_click"
						hidePrimaryCta={ !! section }
					/>
				</Fragment>
			) ) }
		</Card>
	);
}
