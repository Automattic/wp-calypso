import { useCallback } from 'react';
import {
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_HOSTING_REFER_ENTERPRISE_LINK,
	A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK,
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
	A4A_MARKETPLACE_PRODUCTS_LINK,
	A4A_WOOPAYMENTS_OVERVIEW_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { MARKETPLACE_TYPE_SESSION_STORAGE_KEY } from 'calypso/a8c-for-agencies/sections/marketplace/hoc/with-marketplace-type';
import PartnerOffers from 'calypso/dashboard/agency/marketplace/exclusive-offers/partner-offers';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type {
	PartnerOffer,
	PartnerOfferLinks,
} from 'calypso/dashboard/agency/marketplace/exclusive-offers/types';

import './style.scss';

const LINKS: PartnerOfferLinks = {
	hostingWpcom: A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
	hostingPressable: A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	referPressablePremium: A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK,
	referEnterprise: A4A_MARKETPLACE_HOSTING_REFER_ENTERPRISE_LINK,
	products: A4A_MARKETPLACE_PRODUCTS_LINK,
	woopayments: A4A_WOOPAYMENTS_OVERVIEW_LINK,
};

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

	return (
		<PartnerOffers
			links={ LINKS }
			recordTracksEvent={ recordTracks }
			onCtaClick={ handleCtaClick }
		/>
	);
}
