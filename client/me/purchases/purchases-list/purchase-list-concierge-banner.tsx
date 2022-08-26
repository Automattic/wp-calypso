import React from 'react';
import {
	CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION,
	CONCIERGE_HAS_UPCOMING_APPOINTMENT,
} from 'calypso/me/concierge/constants';
import ConciergeBanner from 'calypso/me/purchases/concierge-banner/index';

type Props = {
	nextAppointment?: {
		id: number;
		siteId: number;
		scheduleId: number;
	};
	conciergeSites: number[];
	siteId?: number;
	isUserBlocked: boolean;
};

export function PurchaseListConciergeBanner( props: Props ) {
	const { nextAppointment, conciergeSites, siteId, isUserBlocked } = props;

	if ( isUserBlocked ) {
		return null;
	}

	const hasAppointment = Boolean( nextAppointment );
	const hasSiteSelectedAndIsViewingSite = siteId && conciergeSites.includes( siteId );
	const isNotOnSiteButHasSites = ! siteId && conciergeSites.length;
	const shouldShowBanner =
		hasAppointment || hasSiteSelectedAndIsViewingSite || isNotOnSiteButHasSites;

	if ( ! shouldShowBanner ) {
		return null;
	}

	let bannerType;

	if ( nextAppointment ) {
		bannerType = CONCIERGE_HAS_UPCOMING_APPOINTMENT;
	} else {
		bannerType = CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION;
	}

	return (
		<ConciergeBanner
			bannerType={ bannerType }
			nextAppointmentSiteId={ nextAppointment?.siteId }
			sites={ conciergeSites }
			siteId={ siteId }
		/>
	);
}
