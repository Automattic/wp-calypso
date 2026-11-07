import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { getSpacefastUrl } from '../spacefast/constants';
import SpacefastSymbol from '../spacefast/spacefast-symbol';
import SidebarPromoCard from './sidebar-promo-card';
import type { SidebarPromoTone } from './sidebar-promo-card';
import type { RecordTracksEvent } from '../../tiers/types';

import './spacefast.scss';

/**
 * The Spacefast launch promo. Temporary: when it's done, delete this file and
 * its stylesheet, and drop it from `SidebarPromo`.
 */
export default function SpacefastSidebarPromo( {
	tone,
	recordTracksEvent,
}: {
	tone?: SidebarPromoTone;
	recordTracksEvent: RecordTracksEvent;
} ) {
	const onView = useCallback(
		() => recordTracksEvent( 'calypso_a4a_spacefast_promo_view', { placement: 'sidebar' } ),
		[ recordTracksEvent ]
	);

	return (
		<SidebarPromoCard
			id="spacefast"
			className="is-spacefast"
			tone={ tone }
			icon={ <SpacefastSymbol /> }
			title={ __( 'Spacefast' ) }
			badge={ __( 'New' ) }
			description={ __( 'One shared place to ship your team’s AI work in seconds.' ) }
			cta={ { label: __( 'Try Spacefast' ), href: getSpacefastUrl( 'sidebar' ) } }
			onView={ onView }
			onClick={ () =>
				recordTracksEvent( 'calypso_a4a_spacefast_promo_click', { placement: 'sidebar' } )
			}
		/>
	);
}
