import { useCallback } from 'react';
import { MARKETPLACE_TYPE_SESSION_STORAGE_KEY } from 'calypso/a8c-for-agencies/sections/marketplace/hoc/with-marketplace-type';
import PartnerOffers from 'calypso/dashboard/agency/marketplace/exclusive-offers/partner-offers';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { PartnerOffer } from 'calypso/dashboard/agency/marketplace/exclusive-offers/types';

import './style.scss';

export default function PartnerOffersOverviewContent() {
	const dispatch = useDispatch();

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	// Preserve the classic A4A behavior: stash the marketplace type so the
	// marketplace flow lands on the right tab when the CTA navigates.
	const handleCtaClick = useCallback( ( offer: PartnerOffer ) => {
		if ( offer.cta.purchase_type ) {
			sessionStorage.setItem( MARKETPLACE_TYPE_SESSION_STORAGE_KEY, offer.cta.purchase_type );
		}
	}, [] );

	return <PartnerOffers recordTracksEvent={ recordTracks } onCtaClick={ handleCtaClick } />;
}
