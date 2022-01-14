import { SITE_INTRO_OFFER_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/introductory-offers';
import 'calypso/state/jetpack-checkout/init';

interface GetIntroOffersActionType {
	type: typeof SITE_INTRO_OFFER_REQUEST;
	siteId: number | 'none';
}

export function fetchIntroOffers( siteId: number | 'none' = 'none' ): GetIntroOffersActionType {
	return {
		type: SITE_INTRO_OFFER_REQUEST,
		siteId,
	};
}
